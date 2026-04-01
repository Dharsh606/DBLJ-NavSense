// Multi-Language Support System
// Comprehensive internationalization (i18n) system with local language support

export interface Language {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  dateFormat: string
  timeFormat: '12h' | '24h'
  currency: string
  emergency: string
  numbers: string
  flag?: string
}

export interface Translation {
  [key: string]: string
}

export interface LocalizedContent {
  welcome: string
  navigation: string
  emergency: string
  settings: string
  profile: string
  help: string
  common: {
    yes: string
    no: string
    ok: string
    cancel: string
    save: string
    delete: string
    edit: string
    close: string
    back: string
    next: string
    previous: string
    home: string
    search: string
    loading: string
    error: string
    success: string
    warning: string
    info: string
    start: string
    stop: string
    pause: string
    resume: string
    call: string
    message: string
    contact: string
    location: string
    gps: string
    battery: string
    bluetooth: string
    camera: string
    microphone: string
    speaker: string
    volume: string
    brightness: string
    contrast: string
    zoom: string
    font: string
    theme: string
    language: string
    voice: string
    gesture: string
    accessibility: string
    privacy: string
    security: string
  }
}

class MultiLanguageService {
  private currentLanguage: string = 'en-US'
  private translations: Map<string, Translation> = new Map()
  private fallbackLanguage: string = 'en-US'

  // Supported languages
  private supportedLanguages: Language[] = [
    {
      code: 'en-US',
      name: 'English (US)',
      nativeName: 'English',
      direction: 'ltr',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      emergency: '911',
      numbers: '1,234,567,890',
      flag: '🇺🇸'
    },
    {
      code: 'hi-IN',
      name: 'Hindi (India)',
      nativeName: 'हिन्दी',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'INR',
      emergency: '112',
      numbers: '1,23,45,67,890',
      flag: '🇮🇳'
    },
    {
      code: 'ta-IN',
      name: 'Tamil (India)',
      nativeName: 'தமிழ்',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'INR',
      emergency: '112',
      numbers: '1,23,45,67,890',
      flag: '🇱🇮'
    },
    {
      code: 'te-IN',
      name: 'Telugu (India)',
      nativeName: 'తెలుగు',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'INR',
      emergency: '112',
      numbers: '1,23,45,67,890',
      flag: '🇮🇳'
    },
    {
      code: 'mr-IN',
      name: 'Marathi (India)',
      nativeName: 'मराठठी',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'INR',
      emergency: '112',
      numbers: '1,23,45,67,890',
      flag: '🇮🇳'
    },
    {
      code: 'gu-IN',
      name: 'Gujarati (India)',
      nativeName: 'ગુજરાતી',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'INR',
      emergency: '112',
      numbers: '1,23,45,67,890',
      flag: '🇮🇳'
    },
    {
      code: 'bn-IN',
      name: 'Bengali (India)',
      nativeName: 'বাংলা',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'INR',
      emergency: '112',
      numbers: '1,23,45,67,890',
      flag: '🇮🇳'
    },
    {
      code: 'pa-IN',
      name: 'Punjabi (India)',
      nativeName: 'ਪੰਜਾਬਾਂ',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'INR',
      emergency: '112',
      numbers: '1,23,45,67,890',
      flag: '🇮🇳'
    }
  ]

  constructor() {
    this.loadTranslations()
    this.loadCurrentLanguage()
  }

  // Load translations
  private loadTranslations(): void {
    try {
      const saved = localStorage.getItem('translations')
      if (saved) {
        const translations = JSON.parse(saved)
        Object.keys(translations).forEach(langCode => {
          this.translations.set(langCode, translations[langCode])
        })
      }
    } catch (error) {
      console.error('Failed to load translations:', error)
    }
  }

  // Save translations
  private saveTranslations(): void {
    try {
      const translationsObject = Object.fromEntries(this.translations)
      localStorage.setItem('translations', JSON.stringify(translationsObject))
    } catch (error) {
      console.error('Failed to save translations:', error)
    }
  }

  // Load current language
  private loadCurrentLanguage(): void {
    try {
      const saved = localStorage.getItem('currentLanguage')
      if (saved) {
        this.currentLanguage = saved
      }
    } catch (error) {
      console.error('Failed to load current language:', error)
    }
  }

  // Save current language
  private saveCurrentLanguage(): void {
    try {
      localStorage.setItem('currentLanguage', this.currentLanguage)
      console.log(`Language changed to: ${this.currentLanguage}`)
    } catch (error) {
      console.error('Failed to save current language:', error)
    }
  }

  // Get supported languages
  getSupportedLanguages(): Language[] {
    return this.supportedLanguages
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage
  }

  // Get current language info
  getCurrentLanguageInfo(): Language | null {
    return this.supportedLanguages.find(lang => lang.code === this.currentLanguage) || null
  }

  // Change language
  changeLanguage(languageCode: string): boolean {
    const language = this.supportedLanguages.find(lang => lang.code === languageCode)
    if (!language) {
      console.error(`Language ${languageCode} not supported`)
      return false
    }

    this.currentLanguage = languageCode
    this.saveCurrentLanguage()
    
    // Update document direction
    this.updateDocumentDirection(language.direction)
    
    console.log(`Language changed to: ${language.name}`)
    return true
  }

  // Update document direction based on language
  private updateDocumentDirection(direction: 'ltr' | 'rtl'): void {
    document.documentElement.dir = direction
    document.documentElement.lang = this.currentLanguage
  }

  // Get translation for key
  translate(key: string, params?: Record<string, string>): string {
    const language = this.getCurrentLanguageInfo()
    if (!language) {
      console.error(`Language ${this.currentLanguage} not found`)
      return key
    }

    // Get translation for current language
    const translations = this.getLanguageTranslations(language.code)
    let translation = translations[key] || key
    
    // Replace parameters in translation
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param])
      })
    }
    
    return translation
  }

  // Get translations for specific language
  private getLanguageTranslations(languageCode: string): Translation {
    const translations = this.translations.get(languageCode)
    
    if (translations) {
      return translations
    }
    
    // Return fallback translations if language not available
    return this.getFallbackTranslations()
  }

  // Get fallback translations (English)
  private getFallbackTranslations(): Translation {
    return {
      welcome: 'Welcome to DBLJ NavSense',
      navigation: 'Navigation',
      emergency: 'Emergency',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
      common: {
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        home: 'Home',
        search: 'Search',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        start: 'Start',
        stop: 'Stop',
        pause: 'Pause',
        resume: 'Resume',
        call: 'Call',
        message: 'Message',
        contact: 'Contact',
        location: 'Location',
        gps: 'GPS',
        battery: 'Battery',
        bluetooth: 'Bluetooth',
        camera: 'Camera',
        microphone: 'Microphone',
        speaker: 'Speaker',
        volume: 'Volume',
        brightness: 'Brightness',
        contrast: 'Contrast',
        zoom: 'Zoom',
        font: 'Font',
        theme: 'Theme',
        language: 'Language',
        voice: 'Voice',
        gesture: 'Gesture',
        accessibility: 'Accessibility',
        privacy: 'Privacy',
        security: 'Security'
      }
    }
  }

  // Initialize translations for all supported languages
  initializeTranslations(): void {
    // English translations
    const englishTranslations: Translation = {
      welcome: 'Welcome to DBLJ NavSense',
      navigation: 'Navigation',
      emergency: 'Emergency',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
      common: {
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        home: 'Home',
        search: 'Search',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        start: 'Start',
        stop: 'Stop',
        pause: 'Pause',
        resume: 'Resume',
        call: 'Call',
        message: 'Message',
        contact: 'Contact',
        location: 'Location',
        gps: 'GPS',
        battery: 'Battery',
        bluetooth: 'Bluetooth',
        camera: 'Camera',
        microphone: 'Microphone',
        speaker: 'Speaker',
        volume: 'Volume',
        brightness: 'Brightness',
        contrast: 'Contrast',
        zoom: 'Zoom',
        font: 'Font',
        theme: 'Theme',
        language: 'Language',
        voice: 'Voice',
        gesture: 'Gesture',
        accessibility: 'Accessibility',
        privacy: 'Privacy',
        security: 'Security'
      }
    }

    // Hindi translations
    const hindiTranslations: Translation = {
      welcome: 'डीबीएलजे नेवसेंस का स्वागत में आपका स्वागत में',
      navigation: 'नेविगेशन',
      emergency: 'आपातकाली',
      settings: 'सेटिंग्स',
      profile: 'प्रोफाइल',
      help: 'सहायता',
      common: {
        yes: 'हां',
        no: 'नहीं',
        ok: 'ठीक',
        cancel: 'रद्द करें',
        save: 'सेव करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        close: 'बंद करें',
        back: 'पीछे',
        next: 'अगला',
        previous: 'पिछला',
        home: 'घर',
        search: 'खोजें',
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफलत',
        warning: 'चेतावनी',
        info: 'जानकारी',
        start: 'शुरू करें',
        stop: 'रोकें',
        pause: 'रोकें',
        resume: 'फिर से शुरू करें',
        call: 'कॉल करें',
        message: 'संदेश',
        contact: 'संपर्क',
        location: 'स्थान',
        gps: 'जीपीएस',
        battery: 'बैटरी',
        bluetooth: 'ब्लूटूथ',
        camera: 'कैमरा',
        microphone: 'माइक्रोफोन',
        speaker: 'स्पीकर',
        volume: 'आवाज़',
        brightness: 'चमक',
        contrast: 'कंट्रास्ट',
        zoom: 'जूम',
        font: 'फॉन्ट',
        theme: 'थीम',
        language: 'भाषा',
        voice: 'आवाज़',
        gesture: 'इशारा',
        accessibility: 'पहुँ उपयोगिता',
        privacy: 'गोपनीयता',
        security: 'सुरक्षा'
      }
    }

    // Add translations to map
    this.translations.set('en-US', englishTranslations)
    this.translations.set('hi-IN', hindiTranslations)
    
    // Save initial translations
    this.saveTranslations()
  }

  // Format date according to language
  formatDate(date: Date): string {
    const language = this.getCurrentLanguageInfo()
    if (!language) return date.toLocaleDateString()
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: language.dateFormat.includes('DD') ? '2-digit' : 'long',
      day: language.dateFormat.includes('DD') ? '2-digit' : 'numeric'
    }
    
    return new Intl.DateTimeFormat(language.code, options).format(date)
  }

  // Format time according to language
  formatTime(date: Date): string {
    const language = this.getCurrentLanguageInfo()
    if (!language) return date.toLocaleTimeString()
    
    const options: Intl.DateTimeFormatOptions = {
      hour: language.timeFormat === '24h' ? '2-digit' : 'numeric',
      minute: '2-digit',
      hour12: language.timeFormat === '12h' ? true : undefined
    }
    
    return new Intl.DateTimeFormat(language.code, options).format(date)
  }

  // Format number according to language
  formatNumber(num: number): string {
    const language = this.getCurrentLanguageInfo()
    if (!language) return num.toString()
    
    return new Intl.NumberFormat(language.code).format(num)
  }

  // Get emergency number for current language
  getEmergencyNumber(): string {
    const language = this.getCurrentLanguageInfo()
    return language?.emergency || '911'
  }

  // Get localized content
  getLocalizedContent(): LocalizedContent {
    const language = this.getCurrentLanguageInfo()
    const translations = this.getLanguageTranslations(language.code)
    
    return {
      welcome: translations.welcome,
      navigation: translations.navigation,
      emergency: translations.emergency,
      settings: translations.settings,
      profile: translations.profile,
      help: translations.help,
      common: translations.common
    }
  }

  // Auto-detect user's preferred language
  detectPreferredLanguage(): string {
    // Get user's browser language
    const browserLanguage = navigator.language || navigator.languages?.[0] || 'en-US'
    
    // Map browser language to supported languages
    const preferredLanguage = this.mapBrowserLanguage(browserLanguage)
    
    console.log(`Detected preferred language: ${preferredLanguage}`)
    return preferredLanguage
  }

  // Map browser language to supported languages
  private mapBrowserLanguage(browserLanguage: string): string {
    // Extract language code from browser language string
    const languageCode = browserLanguage.split('-')[0]
    
    // Check if it's one of our supported languages
    const supportedLanguage = this.supportedLanguages.find(lang => 
      lang.code.startsWith(languageCode) || lang.nativeName.includes(languageCode)
    )
    
    if (supportedLanguage) {
      return supportedLanguage.code
    }
    
    // Default to English if no match found
    return this.fallbackLanguage
  }

  // Get service status
  getStatus(): {
    currentLanguage: string
    supportedLanguages: Language[]
    isInitialized: boolean
    translationsLoaded: boolean
  } {
    return {
      currentLanguage: this.currentLanguage,
      supportedLanguages: this.supportedLanguages,
      isInitialized: this.translations.size > 0,
      translationsLoaded: this.translations.size > 0
    }
  }

  // Cleanup resources
  dispose(): void {
    this.translations.clear()
    console.log('Multi-language service disposed')
  }
}

// Export singleton instance
export const multiLanguageService = new MultiLanguageService()
