import { NextRequest, NextResponse } from 'next/server'
import { getWeatherForecast } from '../../../lib/weather'
import { cache } from '../../../lib/cache'
import { rateLimiter } from '../../../lib/rateLimit'

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (rateLimiter.isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimiter.getResetTime(clientIP) - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') || 'owm'
    const cacheKey = `forecast_${provider}`

    // Check cache first
    const cachedData = cache.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Fetch fresh data
    const forecastData = await getWeatherForecast(provider)

    // Cache the result
    cache.set(cacheKey, forecastData, CACHE_TTL)

    return NextResponse.json(forecastData)
  } catch (error) {
    console.error('Error fetching forecast:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather forecast' },
      { status: 500 }
    )
  }
}