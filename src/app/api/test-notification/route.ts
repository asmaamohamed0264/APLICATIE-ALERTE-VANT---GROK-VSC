import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, sendSMS, sendWebPush, generateEmailTemplate, generateSMSTemplate, generateWebPushPayload } from '@/lib/notifications'

const DEFAULT_USER_EMAIL = 'user@example.com'

// Real function to send web push notification
async function sendWebPushNotification(subscription: any, payload: string) {
  const result = await sendWebPush(subscription, payload);
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, threshold } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Notification type required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Ensure default site exists
    const site = await prisma.site.upsert({
      where: { id: 'grand-arena' },
      update: {},
      create: {
        id: 'grand-arena',
        name: 'Grand Arena',
        latitude: 44.439663,
        longitude: 26.096306,
        address: 'Calea București 1K, Otopeni 075100, Romania'
      }
    })

    // Create a test alert event
    const alertEvent = await prisma.alertEvent.create({
      data: {
        siteId: site.id,
        type: 'TEST',
        message: `Test alert for wind threshold: ${threshold || 'default'} km/h`,
        dedupKey: `test-${Date.now()}`
      }
    })

    // Create notification log (will update status after sending)
    const notification = await prisma.notification.create({
      data: {
        alertEventId: alertEvent.id,
        userId: user.id,
        channel: type,
        status: 'pending'
      }
    })

    const sentAt = new Date().toISOString()

    if (type === 'webpush') {
      // Get subscriptions from DB
      const subscriptions = await prisma.webPushSubscription.findMany({
        where: { userId: user.id }
      })

      const message = `Test alert for wind threshold: ${threshold || 'default'} km/h`;
      const payload = generateWebPushPayload('Test Notification', message, threshold || 60);

      // Send to all subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(sub => sendWebPushNotification(sub, payload))
      )

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length

      // Update notification status
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: successCount > 0 ? 'sent' : 'failed'
        }
      })

      return NextResponse.json({
        success: true,
        message: `Test web push notification sent to ${successCount} subscribers`,
        data: {
          type,
          threshold,
          sentAt,
          subscribers: successCount
        }
      })
    }

    // For other types (SMS, email)
    let result: any = { success: false };
    if (type === 'email') {
      const html = generateEmailTemplate('TEST', `Test alert for wind threshold: ${threshold || 'default'} km/h`, threshold || 60);
      result = await sendEmail(user.email, 'Test Alert - Grand Arena Wind Monitor', html);
    } else if (type === 'sms') {
      const phone = '+40712345678'; // Replace with actual user phone
      const text = generateSMSTemplate(`Test alert for wind threshold: ${threshold || 'default'} km/h`, threshold || 60);
      result = await sendSMS(phone, text);
    }

    // Update notification status
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: result.success ? 'sent' : 'failed',
        externalId: result.id
      }
    })

    return NextResponse.json({
      success: result.success,
      message: result.success ? `Test ${type} notification sent` : `Failed to send test ${type} notification`,
      data: {
        type,
        threshold,
        sentAt
      }
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}