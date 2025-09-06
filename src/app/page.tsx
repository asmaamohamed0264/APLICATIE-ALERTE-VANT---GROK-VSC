import Header from '@/components/Header'
import AlertBanner from '@/components/AlertBanner'
import CurrentConditionsCard from '@/components/CurrentConditionsCard'
import MetricsGrid from '@/components/MetricsGrid'
import ForecastChart from '@/components/ForecastChart'
import SettingsSidebar from '@/components/SettingsSidebar'
import Footer from '@/components/Footer'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      
      {/* Alert Banner - conditional */}
      <AlertBanner />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content - 75% on desktop */}
          <div className="flex-1 space-y-6">
            {/* Current Conditions + Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CurrentConditionsCard />
              <MetricsGrid />
            </div>
            
            {/* Forecast Chart */}
            <ForecastChart />
          </div>
          
          {/* Settings Sidebar - 25% on desktop */}
          <div className="lg:w-80">
            <SettingsSidebar />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}