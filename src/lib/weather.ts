import { cache } from './cache';
import { rateLimiter } from './rateLimit';

interface WeatherData {
  tempC: number;
  windKmh: number;
  gustKmh: number;
  humidity: number;
  pressureHpa: number;
  ts: number;
}

interface ForecastPoint {
  ts: number;
  windKmh: number;
  gustKmh: number;
  hazardKmh: number;
}

interface ForecastResponse {
  site: {
    id: number;
    name: string;
    address: string;
    lat: number;
    lon: number;
    timezone: string;
  };
  provider: string;
  current: WeatherData;
  series8h: ForecastPoint[];
  metrics: {
    temperature: number;
    humidity: number;
    pressure: number;
    visibility: number;
  };
}

const SITE = {
  id: 1,
  name: 'Aleea Someșul Cald',
  address: 'Aleea Someșul Cald, București, Romania',
  lat: 44.4268,
  lon: 26.1025,
  timezone: 'Europe/Bucharest'
};

// Resample forecast data to 8-hour intervals
function resampleForecast(series: ForecastPoint[], targetHours: number = 8): ForecastPoint[] {
  if (series.length <= targetHours) return series;

  const resampled: ForecastPoint[] = [];
  const interval = Math.floor(series.length / targetHours);

  for (let i = 0; i < targetHours; i++) {
    const start = i * interval;
    const end = Math.min(start + interval, series.length);
    const points = series.slice(start, end);

    // Average the points in this interval
    const avgWind = points.reduce((sum, p) => sum + p.windKmh, 0) / points.length;
    const avgGust = points.reduce((sum, p) => sum + p.gustKmh, 0) / points.length;
    const maxHazard = Math.max(...points.map(p => p.hazardKmh));

    resampled.push({
      ts: points[0].ts,
      windKmh: Math.round(avgWind),
      gustKmh: Math.round(avgGust),
      hazardKmh: Math.round(maxHazard)
    });
  }

  return resampled;
}

// Normalize weather data
function normalizeWeatherData(data: any, provider: string): ForecastResponse {
  let current: WeatherData;
  let series8h: ForecastPoint[];
  let metrics: any;

  if (provider === 'owm') {
    const currentData = data.current;
    const hourly = data.hourly.slice(0, 8);

    current = {
      tempC: Math.round(currentData.temp),
      windKmh: Math.round(currentData.wind_speed * 3.6),
      gustKmh: Math.round((currentData.wind_gust || currentData.wind_speed) * 3.6),
      humidity: currentData.humidity,
      pressureHpa: currentData.pressure,
      ts: currentData.dt
    };

    series8h = hourly.map((h: any) => ({
      ts: h.dt,
      windKmh: Math.round(h.wind_speed * 3.6),
      gustKmh: Math.round((h.wind_gust || h.wind_speed) * 3.6),
      hazardKmh: Math.round((h.wind_gust || h.wind_speed) * 3.6)
    }));

    metrics = {
      temperature: Math.round(currentData.temp),
      humidity: currentData.humidity,
      pressure: currentData.pressure,
      visibility: currentData.visibility / 1000
    };
  } else { // open-meteo
    const hourly = data.hourly;
    const now = Math.floor(Date.now() / 1000);
    const currentIndex = hourly.time.findIndex((t: string) => new Date(t).getTime() / 1000 >= now);

    current = {
      tempC: Math.round(hourly.temperature_2m[currentIndex]),
      windKmh: Math.round(hourly.wind_speed_10m[currentIndex]),
      gustKmh: Math.round(hourly.wind_gusts_10m[currentIndex] || hourly.wind_speed_10m[currentIndex]),
      humidity: hourly.relative_humidity_2m[currentIndex],
      pressureHpa: Math.round(hourly.pressure_msl[currentIndex]),
      ts: new Date(hourly.time[currentIndex]).getTime() / 1000
    };

    series8h = hourly.time.slice(currentIndex, currentIndex + 8).map((time: string, i: number) => ({
      ts: new Date(time).getTime() / 1000,
      windKmh: Math.round(hourly.wind_speed_10m[currentIndex + i]),
      gustKmh: Math.round(hourly.wind_gusts_10m[currentIndex + i] || hourly.wind_speed_10m[currentIndex + i]),
      hazardKmh: Math.round(hourly.wind_gusts_10m[currentIndex + i] || hourly.wind_speed_10m[currentIndex + i])
    }));

    metrics = {
      temperature: current.tempC,
      humidity: current.humidity,
      pressure: current.pressureHpa,
      visibility: 10
    };
  }

  return {
    site: SITE,
    provider,
    current,
    series8h,
    metrics
  };
}

async function fetchOpenWeatherMap(): Promise<ForecastResponse> {
  const cacheKey = `owm-${SITE.lat}-${SITE.lon}`;
  const cached = cache.get<ForecastResponse>(cacheKey);
  if (cached) return cached;

  if (rateLimiter.isRateLimited('owm')) {
    throw new Error('OpenWeatherMap rate limit exceeded');
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) throw new Error('OpenWeatherMap API key not configured');

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${SITE.lat}&lon=${SITE.lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`OpenWeatherMap API error: ${response.status}`);

  const data = await response.json();

  const normalized = normalizeWeatherData(data, 'owm');
  normalized.series8h = resampleForecast(normalized.series8h);

  cache.set(cacheKey, normalized, 10 * 60 * 1000); // Cache for 10 minutes
  return normalized;
}

async function fetchOpenMeteo(): Promise<ForecastResponse> {
  const cacheKey = `open-meteo-${SITE.lat}-${SITE.lon}`;
  const cached = cache.get<ForecastResponse>(cacheKey);
  if (cached) return cached;

  if (rateLimiter.isRateLimited('open-meteo')) {
    throw new Error('Open-Meteo rate limit exceeded');
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${SITE.lat}&longitude=${SITE.lon}&hourly=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_gusts_10m&forecast_days=1&timezone=Europe%2FBucharest`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo API error: ${response.status}`);

  const data = await response.json();

  const normalized = normalizeWeatherData(data, 'open-meteo');
  normalized.series8h = resampleForecast(normalized.series8h);

  cache.set(cacheKey, normalized, 10 * 60 * 1000); // Cache for 10 minutes
  return normalized;
}

// Blend data from multiple providers
function blendForecastData(responses: ForecastResponse[]): ForecastResponse {
  if (responses.length === 0) throw new Error('No data to blend');
  if (responses.length === 1) return responses[0];

  const base = responses[0];
  const blended: ForecastResponse = {
    ...base,
    provider: 'blended',
    current: { ...base.current },
    series8h: base.series8h.map((point, i) => ({ ...point })),
    metrics: { ...base.metrics }
  };

  // Average current conditions
  for (const response of responses.slice(1)) {
    blended.current.tempC = Math.round((blended.current.tempC + response.current.tempC) / 2);
    blended.current.windKmh = Math.round((blended.current.windKmh + response.current.windKmh) / 2);
    blended.current.gustKmh = Math.round((blended.current.gustKmh + response.current.gustKmh) / 2);
    blended.current.humidity = Math.round((blended.current.humidity + response.current.humidity) / 2);
    blended.current.pressureHpa = Math.round((blended.current.pressureHpa + response.current.pressureHpa) / 2);

    blended.metrics.temperature = Math.round((blended.metrics.temperature + response.metrics.temperature) / 2);
    blended.metrics.humidity = Math.round((blended.metrics.humidity + response.metrics.humidity) / 2);
    blended.metrics.pressure = Math.round((blended.metrics.pressure + response.metrics.pressure) / 2);
    blended.metrics.visibility = Math.round((blended.metrics.visibility + response.metrics.visibility) / 2);

    // Average forecast series
    response.series8h.forEach((point, j) => {
      if (blended.series8h[j]) {
        blended.series8h[j].windKmh = Math.round((blended.series8h[j].windKmh + point.windKmh) / 2);
        blended.series8h[j].gustKmh = Math.round((blended.series8h[j].gustKmh + point.gustKmh) / 2);
        blended.series8h[j].hazardKmh = Math.max(blended.series8h[j].hazardKmh, point.hazardKmh);
      }
    });
  }

  return blended;
}

export async function getWeatherForecast(provider?: string): Promise<ForecastResponse> {
  if (provider === 'owm') {
    return await fetchOpenWeatherMap();
  } else if (provider === 'open-meteo') {
    return await fetchOpenMeteo();
  }

  // Try to blend data from both providers
  const results: ForecastResponse[] = [];
  try {
    results.push(await fetchOpenWeatherMap());
  } catch (error) {
    console.error('OpenWeatherMap failed:', error);
  }

  try {
    results.push(await fetchOpenMeteo());
  } catch (error) {
    console.error('Open-Meteo failed:', error);
  }

  if (results.length === 0) {
    throw new Error('All weather providers failed');
  }

  return blendForecastData(results);
}