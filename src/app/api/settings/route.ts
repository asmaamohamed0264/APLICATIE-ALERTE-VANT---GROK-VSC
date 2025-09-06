import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_USER_EMAIL = 'user@example.com'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { thresholdKmh, webPush, sms, email, phoneNumber, emailAddress } = body

    // Validate input
    if (typeof thresholdKmh !== 'number' || thresholdKmh < 0) {
      return NextResponse.json(
        { error: 'Invalid threshold value' },
        { status: 400 }
      )
    }

    // Upsert user with settings
    const user = await prisma.user.upsert({
      where: { email: DEFAULT_USER_EMAIL },
      update: {
        thresholds: { thresholdKmh },
        preferences: { webPush, sms, email },
        quietHoursStart: phoneNumber,
        quietHoursEnd: emailAddress
      },
      create: {
        email: DEFAULT_USER_EMAIL,
        thresholds: { thresholdKmh },
        preferences: { webPush, sms, email },
        quietHoursStart: phoneNumber,
        quietHoursEnd: emailAddress
      }
    })

    // Update notification channel preferences
    await prisma.notificationChannelPreference.upsert({
      where: { userId_channel: { userId: user.id, channel: 'webpush' } },
      update: { enabled: Boolean(webPush) },
      create: { userId: user.id, channel: 'webpush', enabled: Boolean(webPush) }
    })
    await prisma.notificationChannelPreference.upsert({
      where: { userId_channel: { userId: user.id, channel: 'sms' } },
      update: { enabled: Boolean(sms) },
      create: { userId: user.id, channel: 'sms', enabled: Boolean(sms) }
    })
    await prisma.notificationChannelPreference.upsert({
      where: { userId_channel: { userId: user.id, channel: 'email' } },
      update: { enabled: Boolean(email) },
      create: { userId: user.id, channel: 'email', enabled: Boolean(email) }
    })

    const settings = {
      thresholdKmh,
      webPush: Boolean(webPush),
      sms: Boolean(sms),
      email: Boolean(email),
      phoneNumber: phoneNumber || '',
      emailAddress: emailAddress || ''
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEFAULT_USER_EMAIL },
      include: { notificationChannelPreferences: true }
    })

    if (!user) {
      return NextResponse.json({
        thresholdKmh: 60,
        webPush: true,
        sms: false,
        email: false,
        phoneNumber: '',
        emailAddress: ''
      })
    }

    const prefs = user.notificationChannelPreferences.reduce((acc, pref) => {
      acc[pref.channel] = pref.enabled
      return acc
    }, {} as Record<string, boolean>)

    const settings = {
      thresholdKmh: (user.thresholds as any)?.thresholdKmh || 60,
      webPush: prefs.webpush ?? true,
      sms: prefs.sms ?? false,
      email: prefs.email ?? false,
      phoneNumber: user.quietHoursStart || '',
      emailAddress: user.quietHoursEnd || ''
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}