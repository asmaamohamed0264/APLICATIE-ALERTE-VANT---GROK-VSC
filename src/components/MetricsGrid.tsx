import { Thermometer, Droplets, Gauge, Eye } from 'lucide-react'

export default function MetricsGrid() {
  // Mock data
  const metrics = [
    {
      icon: Thermometer,
      value: '22°C',
      label: 'Temperatură',
      color: 'text-accent-blue'
    },
    {
      icon: Droplets,
      value: '60%',
      label: 'Umiditate',
      color: 'text-accent-blue'
    },
    {
      icon: Gauge,
      value: '1013',
      label: 'Presiune (hPa)',
      color: 'text-accent-blue'
    },
    {
      icon: Eye,
      value: '10',
      label: 'Vizibilitate (km)',
      color: 'text-accent-blue'
    }
  ]

  return (
    <div className="bg-bg-secondary rounded-lg p-6">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon
          return (
            <div key={index} className="text-center">
              <IconComponent size={32} className={`${metric.color} mx-auto mb-2`} />
              <div className="text-3xl font-semibold text-text-primary mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-text-secondary">
                {metric.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}