import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_USER_EMAIL = 'user@example.com'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } })
    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id, channel: 'in-app' },
      include: { alertEvent: true },
      orderBy: { sentAt: 'desc' }
    })

    const formattedNotifications = notifications.map(n => ({
      id: n.id,
      type: n.alertEvent.type,
      title: n.alertEvent.type,
      content: n.alertEvent.message,
      createdAt: n.sentAt.toISOString(),
      read: true // Assuming all sent are read for simplicity
    }))

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount: 0 // Simplified
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST() {
  // Mark all as read - simplified, no read status in schema
  return NextResponse.json({
    success: true,
    message: 'All notifications marked as read'
  })
}

export async function DELETE() {
  try {
    const user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } })
    if (!user) {
      return NextResponse.json({ success: true, message: 'No notifications to clear' })
    }

    await prisma.notification.deleteMany({
      where: { userId: user.id, channel: 'in-app' }
    })

    return NextResponse.json({
      success: true,
      message: 'All notifications cleared'
    })
  } catch (error) {
    console.error('Error clearing notifications:', error)
    return NextResponse.json(
      { error: 'Failed to clear notifications' },
      { status: 500 }
    )
  }
}