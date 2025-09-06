import { NextResponse } from 'next/server'
import { getWeatherForecast } from '../../../lib/weather'

export async function GET() {
  try {
    // Check weather API availability
    let weatherApiStatus = 'available'
    try {
      await getWeatherForecast()
    } catch (error) {
      weatherApiStatus = 'unavailable'
    }

    // Check database (mock for now)
    const databaseStatus = 'connected' // In production, check actual DB connection

    // Check notifications (mock)
    const notificationsStatus = 'operational'

    const overallStatus = weatherApiStatus === 'available' && databaseStatus === 'connected' ? 'healthy' : 'degraded'

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: databaseStatus,
        weather_api: weatherApiStatus,
        notifications: notificationsStatus
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        error: 'Health check failed'
      },
      { status: 503 }
    )
  }
}