'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Globe,
  Volume2,
  Languages,
  CheckCircle,
  Download,
  Upload,
  Settings
} from 'lucide-react'
import { multiLanguageService } from '@/lib/multi-language'

export default function LanguagesPage() {
  const [currentLanguage, setCurrentLanguage] = useState('en-US')
  const [isClient, setIsClient] = useState(false)
  const [supportedLanguages, setSupportedLanguages] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
    const languages = multiLanguageService.getSupportedLanguages()
    setSupportedLanguages(languages)
    setCurrentLanguage(multiLanguageService.getCurrentLanguage())
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    multiLanguageService.changeLanguage(languageCode)
    setCurrentLanguage(languageCode)
    
    // Speak confirmation in the new language
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Language changed successfully')
      utterance.lang = languageCode
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleVoiceSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    const speedMap = { slow: 0.8, normal: 1.0, fast: 1.2 }
    const utterance = new SpeechSynthesisUtterance('Voice speed updated')
    utterance.rate = speedMap[speed]
    window.speechSynthesis.speak(utterance)
  }

  const handleVoiceTypeChange = (type: 'male' | 'female' | 'auto') => {
    const utterance = new SpeechSynthesisUtterance('Voice type updated')
    window.speechSynthesis.speak(utterance)
  }

  const downloadTranslations = () => {
    const userData = {
      currentLanguage: multiLanguageService.getCurrentLanguage(),
      supportedLanguages: multiLanguageService.getSupportedLanguages(),
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'navsense-language-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importTranslations = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const data = JSON.parse(content)
            if (data.currentLanguage) {
              multiLanguageService.changeLanguage(data.currentLanguage)
              alert('Language settings imported successfully')
            }
          } catch (error) {
            alert('Invalid file format')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-gray-100 mr-3"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <h1 className="text-xl font-semibold">Multi-Language Support</h1>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center mb-6">
            <Globe className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Select Language</h2>
              <p className="text-gray-600">Choose your preferred language for voice guidance and interface</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedLanguages.map((language, index) => (
              <motion.div
                key={language.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-lg p-4 border-2 cursor-pointer transition-all ${
                  currentLanguage === language.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mr-3">
                      <Languages className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {language.nativeName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language.name}
                      </p>
                    </div>
                  </div>
                  {currentLanguage === language.code && (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>📅 {language.dateFormat}</span>
                    <span>🕐 {language.timeFormat}</span>
                    <span>📞 {language.emergency}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Voice Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center mb-6">
            <Volume2 className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Voice Settings</h2>
              <p className="text-gray-600">Customize voice guidance preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Voice Speed</h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleVoiceSpeedChange('slow')}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Slow
                </button>
                <button 
                  onClick={() => handleVoiceSpeedChange('normal')}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Normal
                </button>
                <button 
                  onClick={() => handleVoiceSpeedChange('fast')}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Fast
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Voice Type</h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleVoiceTypeChange('male')}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Male
                </button>
                <button 
                  onClick={() => handleVoiceTypeChange('female')}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Female
                </button>
                <button 
                  onClick={() => handleVoiceTypeChange('auto')}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Auto
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Translation Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Translation Status</h2>
              <p className="text-gray-600">Available translations and features</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Navigation Commands</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Emergency Alerts</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">UI Elements</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Voice Feedback</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadTranslations}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Settings
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={importTranslations}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/profile'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Volume2 className="w-6 h-6 text-blue-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Voice Test</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/themes'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Globe className="w-6 h-6 text-purple-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Themes</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/settings'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Settings className="w-6 h-6 text-gray-600 mb-2 mx-auto" />
            <span className="text-sm font-medium">Settings</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/help'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <CheckCircle className="w-6 h-6 text-green-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Help</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
