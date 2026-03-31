'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Palette,
  Accessibility,
  Monitor,
  Smartphone,
  CheckCircle,
  Settings,
  Volume2,
  Zap
} from 'lucide-react'
import { themeService } from '@/lib/theme-service'

export default function ThemesPage() {
  const [currentTheme, setCurrentTheme] = useState('light')
  const [isClient, setIsClient] = useState(false)
  const [availableThemes, setAvailableThemes] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
    const themes = themeService.getAllThemes()
    setAvailableThemes(themes)
    setCurrentTheme(themeService.getCurrentTheme()?.id || 'light')
  }, [])

  const handleThemeChange = (themeId: string) => {
    themeService.applyTheme(themeId)
    setCurrentTheme(themeId)
  }

  const handleAccessibilityToggle = (setting: string, value: boolean) => {
    // Apply accessibility settings immediately
    if (setting === 'highContrast') {
      document.documentElement.classList.toggle('high-contrast', value)
    }
    if (setting === 'largeText') {
      document.documentElement.style.fontSize = value ? '18px' : '16px'
    }
    if (setting === 'reduceMotion') {
      document.documentElement.classList.toggle('reduce-motion', value)
    }
  }

  const handleTextSizeChange = (size: string) => {
    const fontSize = 
      size === 'small' ? '14px' : 
      size === 'medium' ? '16px' : 
      size === 'large' ? '18px' : '20px'
    document.documentElement.style.fontSize = fontSize
  }

  const handleFontFamilyChange = (font: string) => {
    const fontFamily = 
      font === 'default' ? 'Inter, system-ui, -apple-system, sans-serif' :
      font === 'dyslexic' ? 'OpenDyslexic, Arial, sans-serif' :
      'Georgia, serif'
    document.documentElement.style.fontFamily = fontFamily
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
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
            <h1 className="text-xl font-semibold">Themes & Accessibility</h1>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center mb-6">
            <Palette className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Choose Theme</h2>
              <p className="text-gray-600">Select a theme that's comfortable for your eyes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableThemes.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`relative rounded-lg p-4 border-2 cursor-pointer transition-all ${
                  currentTheme === theme.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
                    {theme.displayName}
                  </h3>
                  {currentTheme === theme.id && (
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                  )}
                </div>
                
                {/* Theme Preview */}
                <div className="h-20 rounded mb-3 flex items-center justify-center text-sm font-medium"
                     style={{
                       backgroundColor: theme.colors.background,
                       color: theme.colors.text,
                       border: `1px solid ${theme.colors.border}`
                     }}>
                  <div className="text-center">
                    <div className="mb-1">Sample Text</div>
                    <div className="flex justify-center space-x-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.colors.primary }}></div>
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.colors.secondary }}></div>
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.colors.accent }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {theme.type === 'dark' && <Moon className="inline w-3 h-3 mr-1" />}
                  {theme.type === 'light' && <Sun className="inline w-3 h-3 mr-1" />}
                  {theme.type === 'high-contrast' && <Eye className="inline w-3 h-3 mr-1" />}
                  {theme.type}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Accessibility Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center mb-6">
            <Accessibility className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Accessibility Options</h2>
              <p className="text-gray-600">Enhance your visual and interaction experience</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">High Contrast Mode</span>
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Increase contrast for better visibility</p>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  onChange={(e) => handleAccessibilityToggle('highContrast', e.target.checked)}
                />
                <span className="text-sm">Enable high contrast</span>
              </label>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Large Text</span>
                <Monitor className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Increase font size for readability</p>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  onChange={(e) => handleAccessibilityToggle('largeText', e.target.checked)}
                />
                <span className="text-sm">Use large text</span>
              </label>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Reduce Motion</span>
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Minimize animations and transitions</p>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  onChange={(e) => handleAccessibilityToggle('reduceMotion', e.target.checked)}
                />
                <span className="text-sm">Reduce motion effects</span>
              </label>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Screen Reader</span>
                <Volume2 className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">Optimize for screen readers</p>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="text-sm">Screen reader mode</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Display Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center mb-6">
            <Smartphone className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Display Settings</h2>
              <p className="text-gray-600">Customize visual appearance</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Text Size</h3>
                <p className="text-sm text-gray-600">Adjust text size for comfort</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleTextSizeChange('small')}
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Small
                </button>
                <button 
                  onClick={() => handleTextSizeChange('medium')}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Medium
                </button>
                <button 
                  onClick={() => handleTextSizeChange('large')}
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Large
                </button>
                <button 
                  onClick={() => handleTextSizeChange('xl')}
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-blue-500 hover:text-white transition-colors"
                >
                  XL
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Font Family</h3>
                <p className="text-sm text-gray-600">Choose comfortable font</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleFontFamilyChange('default')}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Default
                </button>
                <button 
                  onClick={() => handleFontFamilyChange('dyslexic')}
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Dyslexic
                </button>
                <button 
                  onClick={() => handleFontFamilyChange('serif')}
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Serif
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Color Blind Mode</h3>
                <p className="text-sm text-gray-600">Color blind friendly palette</p>
              </div>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  onChange={(e) => document.documentElement.classList.toggle('colorblind-mode', e.target.checked)}
                />
                <span className="text-sm">Enable color blind mode</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/profile'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Accessibility className="w-6 h-6 text-blue-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Profile</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/languages'}
            className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow"
          >
            <Palette className="w-6 h-6 text-purple-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Languages</span>
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
            <Eye className="w-6 h-6 text-green-500 mb-2 mx-auto" />
            <span className="text-sm font-medium">Help</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
