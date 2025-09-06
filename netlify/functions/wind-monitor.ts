import { Handler } from '@netlify/functions'
import { getWeatherForecast } from '../../src/lib/weather'
import { generateAlertMessage } from '../../src/lib/ai'
import { PrismaClient } from '@prisma/client'
import { sendEmail, sendSMS, sendWebPush, generateEmailTemplate, generateSMSTemplate, generateWebPushPayload } from '../../src/lib/notifications'

const prisma = new PrismaClient()

const DEFAULT_USER_EMAIL = 'user@example.com'
const DEFAULT_SITE_ID = 'grand-arena'

// Determine alert level
function getAlertLevel(windSpeed: number, threshold: number): 'low' | 'moderate' | 'high' | 'extreme' {
  const ratio = windSpeed / threshold;
  if (ratio >= 1.5) return 'extreme';
  if (ratio >= 1.2) return 'high';
  if (ratio >= 1.0) return 'moderate';
  return 'low';
}

// Real web push sender
async function sendWebPushAlert(subscription: any, message: string, windSpeed: number) {
  const payload = generateWebPushPayload('Alertă Vânt', message, windSpeed);
  const result = await sendWebPush(subscription, payload);
  return result;
}

export const handler: Handler = async (event, context) => {
  try {
    console.log('Wind monitor function triggered at:', new Date().toISOString())

    // Ensure default site exists
    await prisma.site.upsert({
      where: { id: DEFAULT_SITE_ID },
      update: {},
      create: {
        id: DEFAULT_SITE_ID,
        name: 'Grand Arena',
        latitude: 44.439663,
        longitude: 26.096306,
        address: 'Calea București 1K, Otopeni 075100, Romania'
      }
    })

    // Ensure default user exists
    const user = await prisma.user.upsert({
      where: { email: DEFAULT_USER_EMAIL },
      update: {},
      create: { email: DEFAULT_USER_EMAIL }
    })

    // Get user settings
    const userPrefs = await prisma.notificationChannelPreference.findMany({
      where: { userId: user.id }
    })
    const prefs = userPrefs.reduce((acc, pref) => {
      acc[pref.channel] = pref.enabled
      return acc
    }, {} as Record<string, boolean>)

    const threshold = (user.thresholds as any)?.thresholdKmh || 60

    // Fetch current forecast
    const forecast = await getWeatherForecast()

    // Evaluate risks
    const highRiskPoints = forecast.series8h.filter(point => point.hazardKmh >= threshold)

    if (highRiskPoints.length > 0) {
      const nextAlert = highRiskPoints[0]
      const timeUntilHours = Math.round((nextAlert.ts - Date.now() / 1000) / 3600)
      const alertLevel = getAlertLevel(nextAlert.hazardKmh, threshold)

      // Generate AI message
      const alertData = {
        location: forecast.site.name,
        level: alertLevel,
        when: `în ${timeUntilHours} ore`,
        peak: nextAlert.hazardKmh,
        threshold
      }
      const aiMessage = await generateAlertMessage(alertData)

      // Create alert event
      const alertEvent = await prisma.alertEvent.create({
        data: {
          siteId: DEFAULT_SITE_ID,
          type: 'WIND_ALERT',
          message: aiMessage,
          dedupKey: `wind-${nextAlert.ts}`
        }
      })

      // Send notifications based on preferences
      if (prefs.webpush) {
        const subscriptions = await prisma.webPushSubscription.findMany({
          where: { userId: user.id }
        })
        await Promise.all(
          subscriptions.map(async (sub) => {
            const result = await sendWebPushAlert(sub, aiMessage, nextAlert.hazardKmh)
            await prisma.notification.create({
              data: {
                alertEventId: alertEvent.id,
                userId: user.id,
                channel: 'webpush',
                status: result.success ? 'sent' : 'failed',
                externalId: result.id
              }
            })
          })
        )
      }

      if (prefs.email) {
        const html = generateEmailTemplate('WIND_ALERT', aiMessage, nextAlert.hazardKmh);
        const result = await sendEmail(user.email, 'Alertă Vânt - Grand Arena Wind Monitor', html);
        await prisma.notification.create({
          data: {
            alertEventId: alertEvent.id,
            userId: user.id,
            channel: 'email',
            status: result.success ? 'sent' : 'failed',
            externalId: result.id
          }
        })
      }

      if (prefs.sms) {
        const phone = '+40712345678'; // Replace with actual user phone from database
        const text = generateSMSTemplate(aiMessage, nextAlert.hazardKmh);
        const result = await sendSMS(phone, text);
        await prisma.notification.create({
          data: {
            alertEventId: alertEvent.id,
            userId: user.id,
            channel: 'sms',
            status: result.success ? 'sent' : 'failed',
            externalId: result.id
          }
        })
      }

      // Create in-app notification
      await prisma.notification.create({
        data: {
          alertEventId: alertEvent.id,
          userId: user.id,
          channel: 'in-app',
          status: 'sent'
        }
      })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Wind monitoring completed',
        alertsTriggered: highRiskPoints.length,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Wind monitor error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Wind monitoring failed',
        timestamp: new Date().toISOString()
      })
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Netlify schedule configuration (add to netlify.toml)
// [functions.wind-monitor]
//   schedule = "*/10 * * * *"