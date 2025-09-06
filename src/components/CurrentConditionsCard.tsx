import { Navigation } from 'lucide-react'

export default function CurrentConditionsCard() {
  // Mock data - in real app this would come from API
  const currentWindSpeed = 45
  const currentGust = 55
  const windDirection = 270 // degrees
  const location = "Aleea Someșul Cald"
  const timestamp = new Date()

  const getBorderColor = () => {
    if (currentWindSpeed >= 60) return 'border-accent-red'
    if (currentWindSpeed >= 40) return 'border-accent-yellow'
    return 'border-accent-green'
  }

  const getDirectionAbbrev = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  return (
    <div className={`bg-bg-secondary border-2 ${getBorderColor()} rounded-lg p-6 h-48`}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        🌪️ Condiții Actuale de Vânt
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Wind Speed */}
        <div className="text-center">
          <div className="text-5xl font-bold text-accent-blue mb-1">
            {currentWindSpeed}
          </div>
          <div className="text-sm text-text-secondary">km/h</div>
          <div className="text-xs text-text-muted">Viteza Vântului</div>
        </div>

        {/* Gusts */}
        <div className="text-center">
          <div className="text-5xl font-bold text-accent-blue mb-1">
            {currentGust}
          </div>
          <div className="text-sm text-text-secondary">km/h</div>
          <div className="text-xs text-text-muted">Rafale</div>
        </div>
      </div>

      {/* Wind Direction */}
      <div className="flex justify-center items-center gap-2 mb-2">
        <Navigation 
          size={24} 
          className="text-accent-green transform" 
          style={{ transform: `rotate(${windDirection}deg)` }}
        />
        <span className="text-xl font-semibold text-accent-green">
          {getDirectionAbbrev(windDirection)}
        </span>
        <span className="text-sm text-text-secondary">
          {windDirection}°
        </span>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-text-muted">
        📍 {location} • {timestamp.toLocaleTimeString('ro-RO', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  )
}