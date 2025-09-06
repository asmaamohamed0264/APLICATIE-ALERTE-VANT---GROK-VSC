'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function ForecastChart() {
  // Mock data for 8 hours
  const forecastData = [
    { time: 'Now', windSpeed: 45, windGust: 55, hour: '20:00' },
    { time: '21:00', windSpeed: 52, windGust: 62, hour: '21:00' },
    { time: '22:00', windSpeed: 58, windGust: 68, hour: '22:00' },
    { time: '23:00', windSpeed: 67, windGust: 77, hour: '23:00' },
    { time: '00:00', windSpeed: 72, windGust: 82, hour: '00:00' },
    { time: '01:00', windSpeed: 65, windGust: 75, hour: '01:00' },
    { time: '02:00', windSpeed: 58, windGust: 68, hour: '02:00' },
    { time: '03:00', windSpeed: 50, windGust: 60, hour: '03:00' },
  ]

  const userThreshold = 60 // km/h

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-secondary border border-border-color rounded-lg p-3 shadow-lg">
          <p className="text-text-primary font-medium">{`Ora: ${label}`}</p>
          <p className="text-accent-blue">{`Viteza: ${payload[0]?.value} km/h`}</p>
          <p className="text-accent-blue opacity-75">{`Rafale: ${payload[1]?.value} km/h`}</p>
          <p className="text-accent-yellow">{`Prag: ${userThreshold} km/h`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-bg-secondary rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          📈 Prognoză Vânt 8 Ore
        </h2>
        <p className="text-sm text-text-secondary">
          Următoarele 8 ore • Actualizări la fiecare 3 ore
        </p>
      </div>

      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
              domain={[0, 120]}
              ticks={[0, 20, 40, 60, 80, 100, 120]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#f1f5f9' }}
              formatter={(value) => <span style={{ color: '#f1f5f9' }}>{value}</span>}
            />
            
            {/* Threshold line */}
            <ReferenceLine
              y={userThreshold}
              stroke="#f59e0b"
              strokeDasharray="10,5"
            />
            
            {/* Wind speed line */}
            <Line 
              type="monotone" 
              dataKey="windSpeed" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Viteza Vântului"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            
            {/* Wind gust line */}
            <Line 
              type="monotone" 
              dataKey="windGust" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5,5"
              name="Rafale de Vânt"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline details */}
      <div className="bg-bg-tertiary rounded-lg p-4">
        <div className="grid grid-cols-8 gap-2 text-center text-sm">
          {forecastData.map((point, index) => (
            <div key={index} className="space-y-1">
              <div className="text-text-secondary">{point.time}</div>
              <div className={`font-semibold ${point.windSpeed > userThreshold ? 'text-accent-red' : 'text-accent-green'}`}>
                {point.windSpeed} km/h
              </div>
              <div className={`text-xs ${point.windSpeed > userThreshold ? 'text-accent-red' : 'text-accent-green'}`}>
                {point.windSpeed > userThreshold ? 'Alertă' : 'Normal'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}