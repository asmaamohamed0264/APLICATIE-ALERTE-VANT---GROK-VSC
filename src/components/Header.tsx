import Image from 'next/image'
import { RefreshCw, MapPin } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-bg-secondary border-b border-border-color px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Grand Arena Wind Monitor"
            width={32}
            height={32}
            className="rounded"
          />
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              Monitor Vânt Aleea Someșul Cald
            </h1>
            <div className="flex items-center gap-1 text-sm text-text-secondary">
              <MapPin size={14} />
              <span>București, România</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent-green rounded-full"></div>
            <span className="text-sm text-accent-green font-medium">Online</span>
          </div>
          
          <span className="text-sm text-text-secondary">
            Ultima actualizare: {new Date().toLocaleTimeString('ro-RO', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
          
          <button className="flex items-center gap-2 bg-accent-blue text-text-primary px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            <RefreshCw size={16} />
            Actualizează
          </button>
        </div>
      </div>
    </header>
  )
}