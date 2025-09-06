import { AlertTriangle } from 'lucide-react'

interface AlertBannerProps {
  isActive?: boolean
  severity?: 'low' | 'moderate' | 'high' | 'extreme'
  title?: string
  description?: string
  peakSpeed?: number
  threshold?: number
  hoursUntil?: number
}

export default function AlertBanner({
  isActive = true,
  severity = 'high',
  title = 'PERICOL MAJOR DE VÂNT',
  description = 'DANGER: Vânt extrem prognozat! Viteze peste 60 km/h în următoarele ore.',
  peakSpeed = 75,
  threshold = 60,
  hoursUntil = 3
}: AlertBannerProps) {
  if (!isActive) return null

  const getGradient = () => {
    switch (severity) {
      case 'low': return 'bg-gradient-to-r from-accent-green to-green-600'
      case 'moderate': return 'bg-gradient-to-r from-accent-yellow to-yellow-600'
      case 'high': return 'bg-gradient-to-r from-accent-orange to-orange-600'
      case 'extreme': return 'bg-gradient-to-r from-accent-red to-red-600'
      default: return 'bg-gradient-to-r from-accent-red to-red-600'
    }
  }

  return (
    <div className={`${getGradient()} text-text-primary p-6 shadow-lg`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-text-primary" />
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          <span className="text-sm font-medium">Now</span>
        </div>

        <p className="text-lg mb-6">{description}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{peakSpeed} km/h</div>
            <div className="text-sm">Viteza Maximă</div>
          </div>
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">Now</div>
            <div className="text-sm">Activ în prezent</div>
          </div>
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">DANGER</div>
            <div className="text-sm">Nivel Alertă</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Recomandări de Siguranță:</h3>
          <ul className="space-y-2 text-sm">
            <li>• Rămâi în interior și evită activitățile în aer liber</li>
            <li>• Fixează sau îndepărtează obiectele mobile din exterior</li>
            <li>• Evită conducerea, în special a vehiculelor înalte</li>
            <li>• Stai departe de ferestre și copaci</li>
          </ul>
        </div>
      </div>
    </div>
  )
}