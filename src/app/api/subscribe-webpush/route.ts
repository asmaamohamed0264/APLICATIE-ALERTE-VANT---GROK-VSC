import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_USER_EMAIL = 'user@example.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, keys } = body

    // Validate subscription
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } })
    if (!user) {
      user = await prisma.user.create({ data: { email: DEFAULT_USER_EMAIL } })
    }

    // Upsert subscription
    await prisma.webPushSubscription.upsert({
      where: { userId_endpoint: { userId: user.id, endpoint } },
      update: { p256dh: keys.p256dh, auth: keys.auth },
      create: { userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth }
    })

    return NextResponse.json({
      success: true,
      message: 'Web Push subscription saved successfully'
    })
  } catch (error) {
    console.error('Error saving subscription:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const result = await prisma.webPushSubscription.deleteMany({
      where: { userId: user.id, endpoint }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Web Push subscription removed successfully'
    })
  } catch (error) {
    console.error('Error removing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}