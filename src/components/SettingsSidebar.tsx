'use client'

import { useState } from 'react'
import { Bell, Smartphone, Mail, Send } from 'lucide-react'

export default function SettingsSidebar() {
  const [threshold, setThreshold] = useState(60)
  const [webPushEnabled, setWebPushEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emailAddress, setEmailAddress] = useState('')

  const getThresholdLabel = (value: number) => {
    if (value < 40) return 'Ușor'
    if (value < 60) return 'Moderat'
    if (value < 80) return 'Puternic'
    return 'Extrem'
  }

  return (
    <div className="bg-bg-primary rounded-lg p-5 space-y-6">
      {/* Threshold Card */}
      <div className="bg-bg-secondary rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          ⚠️ Prag de Alertă
        </h3>

        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-accent-red mb-1">
            {threshold}
          </div>
          <div className="text-sm text-text-secondary">km/h</div>
          <div className="text-xs text-text-muted">{getThresholdLabel(threshold)}</div>
        </div>

        <input
          type="range"
          min="20"
          max="100"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer slider"
        />

        <div className="flex justify-between text-xs text-text-muted mt-2">
          <span>20 km/h</span>
          <span>100 km/h</span>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-bg-secondary rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          ❓ Cum funcționează
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          Vei primi alerte când vitezele vântului prognozate (inclusiv rafalele) 
          depășesc pragul selectat în următoarele 8 ore. Sistemul monitorizează 
          continuu prognoza meteo pentru a te avertiza din timp.
        </p>
      </div>

      {/* Notification Settings */}
      <div className="bg-bg-secondary rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          🔔 Setări Notificări
        </h3>

        {/* Web Push */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-accent-blue" />
              <span className="text-sm font-medium text-text-primary">
                Notificări Push Browser
              </span>
            </div>
            <button
              onClick={() => setWebPushEnabled(!webPushEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                webPushEnabled ? 'bg-accent-green' : 'bg-bg-tertiary'
              }`}
            >
              <div className={`w-5 h-5 bg-text-primary rounded-full transition-transform ${
                webPushEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <p className="text-xs text-text-secondary mb-2">
            Primește alerte instantanee în browser când sunt prognosticate vânturi periculoase
          </p>
          {webPushEnabled && (
            <p className="text-xs text-accent-green">✅ Notificările push sunt activate</p>
          )}
          <button className="mt-2 w-full bg-bg-tertiary text-text-primary py-2 px-3 rounded text-sm hover:bg-gray-600 transition-colors">
            ✅ Trimite Notificare de Test
          </button>
        </div>

        {/* SMS */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-accent-blue" />
              <span className="text-sm font-medium text-text-primary">
                Alerte SMS
              </span>
            </div>
            <button
              onClick={() => setSmsEnabled(!smsEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                smsEnabled ? 'bg-accent-green' : 'bg-bg-tertiary'
              }`}
            >
              <div className={`w-5 h-5 bg-text-primary rounded-full transition-transform ${
                smsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <p className="text-xs text-text-secondary mb-2">
            Primește alerte prin mesaje text chiar și când nu ești online
          </p>
          <input
            type="tel"
            placeholder="+40765442365"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-text-primary placeholder-text-muted text-sm mb-2"
          />
          <button className="w-full bg-accent-blue text-text-primary py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors">
            Configurează SMS
          </button>
        </div>

        {/* Email */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-accent-blue" />
              <span className="text-sm font-medium text-text-primary">
                Alerte Email
              </span>
            </div>
            <button
              onClick={() => setEmailEnabled(!emailEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                emailEnabled ? 'bg-accent-green' : 'bg-bg-tertiary'
              }`}
            >
              <div className={`w-5 h-5 bg-text-primary rounded-full transition-transform ${
                emailEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <p className="text-xs text-text-secondary mb-2">
            Primește alerte detaliate prin email cu recomandări de siguranță
          </p>
          <input
            type="email"
            placeholder="adresa@email.com"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-text-primary placeholder-text-muted text-sm mb-2"
          />
          <button className="w-full bg-accent-green text-text-primary py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors">
            Configurează Email
          </button>
        </div>

        <p className="text-xs text-text-muted">
          Alertele sunt trimise când vitezele vântului depășesc pragul configurat. 
          Te poți dezabona oricând din orice tip de notificare.
        </p>
      </div>
    </div>
  )
}