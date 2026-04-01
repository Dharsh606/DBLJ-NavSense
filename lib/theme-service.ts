// Dark Mode and Accessibility Themes System
// Comprehensive theming system with dark mode, high contrast, and accessibility features

export interface Theme {
  id: string
  name: string
  displayName: string
  type: 'light' | 'dark' | 'high-contrast' | 'blue-light' | 'sepia'
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
    info: string
  }
  fonts: {
    primary: string
    secondary: string
    mono: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

export interface AccessibilitySettings {
  highContrast: boolean
  reduceMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  voiceNavigation: boolean
  hapticFeedback: boolean
  largeText: boolean
  focusVisible: boolean
  colorBlindMode: boolean
  dyslexicFont: boolean
  autoDetectObstacles: boolean
  gestureControls: boolean
}

export interface ThemeSettings {
  currentTheme: string
  autoSwitch: boolean
  followSystem: boolean
  customColors: Partial<Theme['colors']> | null
  customFonts: Partial<Theme['fonts']> | null
  accessibility: AccessibilitySettings
}

class ThemeService {
  private themes: Map<string, Theme> = new Map()
  private settings: ThemeSettings
  private isInitialized: boolean = false

  constructor() {
    this.settings = this.loadSettings()
    this.initializeThemes()
  }

  // Load theme settings
  private loadSettings(): ThemeSettings {
    try {
      const saved = localStorage.getItem('themeSettings')
      if (saved) {
        return JSON.parse(saved)
      }
      
      return {
        currentTheme: 'light',
        autoSwitch: false,
        followSystem: false,
        customColors: null,
        customFonts: null,
        accessibility: {
          highContrast: false,
          reduceMotion: false,
          screenReader: true,
          keyboardNavigation: true,
          voiceNavigation: true,
          hapticFeedback: true,
          largeText: false,
          focusVisible: true,
          colorBlindMode: false,
          dyslexicFont: false,
          autoDetectObstacles: true,
          gestureControls: true
        }
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error)
      return this.getDefaultSettings()
    }
  }

  // Save theme settings
  private saveSettings(): void {
    try {
      localStorage.setItem('themeSettings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save theme settings:', error)
    }
  }

  // Get default theme settings
  private getDefaultSettings(): ThemeSettings {
    return {
      currentTheme: 'light',
      autoSwitch: false,
      followSystem: false,
      customColors: null,
      customFonts: null,
      accessibility: {
        highContrast: false,
        reduceMotion: false,
        screenReader: true,
        keyboardNavigation: true,
        voiceNavigation: true,
        hapticFeedback: true,
        largeText: false,
        focusVisible: true,
        colorBlindMode: false,
        dyslexicFont: false,
        autoDetectObstacles: true,
        gestureControls: true
      }
    }
  }

  // Initialize themes
  private initializeThemes(): void {
    // Light theme
    const lightTheme: Theme = {
      id: 'light',
      name: 'Light',
      displayName: 'Light Mode',
      type: 'light',
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6'
      },
      fonts: {
        primary: 'Inter, system-ui, -apple-system, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'Monaco, Consolas, monospace'
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem'
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem'
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
      }
    }

    // Dark theme
    const darkTheme: Theme = {
      id: 'dark',
      name: 'Dark',
      displayName: 'Dark Mode',
      type: 'dark',
      colors: {
        primary: '#60a5fa',
        secondary: '#374151',
        accent: '#8b5cf6',
        background: '#000000',
        surface: '#1f2937',
        text: '#ffffff',
        textSecondary: '#9ca3af',
        border: '#374151',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6'
      },
      fonts: {
        primary: 'Inter, system-ui, -apple-system, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'Monaco, Consolas, monospace'
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem'
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem'
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.3)'
      }
    }

    // High contrast theme
    const highContrastTheme: Theme = {
      id: 'high-contrast',
      name: 'High Contrast',
      displayName: 'High Contrast Mode',
      type: 'high-contrast',
      colors: {
        primary: '#ffffff',
        secondary: '#000000',
        accent: '#ffff00',
        background: '#000000',
        surface: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#cccccc',
        border: '#ffffff',
        error: '#ff0000',
        warning: '#ffff00',
        success: '#00ff00',
        info: '#ffffff'
      },
      fonts: {
        primary: 'Inter, system-ui, -apple-system, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'Monaco, Consolas, monospace'
      },
      spacing: {
        xs: '0.75rem',
        sm: '1rem',
        md: '1.25rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem'
      },
      shadows: {
        sm: '0 2px 4px rgba(255, 255, 255, 0.5)',
        md: '0 6px 8px rgba(255, 255, 255, 0.5)',
        lg: '0 10px 16px rgba(255, 255, 255, 0.5)',
        xl: '0 12px 24px rgba(255, 255, 255, 0.5)'
      }
    }

    // Blue light theme
    const blueLightTheme: Theme = {
      id: 'blue-light',
      name: 'Blue Light',
      displayName: 'Blue Light Mode',
      type: 'light',
      colors: {
        primary: '#2196f3',
        secondary: '#3b82f6',
        accent: '#06b6d4',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e5e7eb',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6'
      },
      fonts: {
        primary: 'Inter, system-ui, -apple-system, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'Monaco, Consolas, monospace'
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem'
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem'
      },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
      }
    }

    // Sepia theme
    const sepiaTheme: Theme = {
      id: 'sepia',
      name: 'Sepia',
      displayName: 'Sepia Mode',
      type: 'light',
      colors: {
        primary: '#704214',
        secondary: '#f4e4c1',
        accent: '#92400e',
        background: '#fdf6e3',
        surface: '#ffffff',
        text: '#5d4037',
        textSecondary: '#92400e',
        border: '#d2b48c',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6'
      },
      fonts: {
        primary: 'Inter, system-ui, -apple-system, sans-serif',
        secondary: 'Georgia, serif',
        mono: 'Monaco, Consolas, monospace'
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem'
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem'
      },
      shadows: {
        sm: '0 1px 2px rgba(112, 64, 15, 0.1)',
        md: '0 4px 6px rgba(112, 64, 15, 0.1)',
        lg: '0 10px 15px rgba(112, 64, 15, 0.1)',
        xl: '0 20px 25px rgba(112, 64, 15, 0.1)'
      }
    }

    // Add all themes to map
    this.themes.set('light', lightTheme)
    this.themes.set('dark', darkTheme)
    this.themes.set('high-contrast', highContrastTheme)
    this.themes.set('blue-light', blueLightTheme)
    this.themes.set('sepia', sepiaTheme)
    
    this.isInitialized = true
  }

  // Get all available themes
  getAllThemes(): Theme[] {
    return Array.from(this.themes.values())
  }

  // Get current theme
  getCurrentTheme(): Theme | null {
    return this.themes.get(this.settings.currentTheme) || null
  }

  // Apply theme
  applyTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId)
    if (!theme) {
      console.error(`Theme ${themeId} not found`)
      return false
    }

    // Apply CSS variables
    this.applyCSSVariables(theme)
    
    // Update settings
    this.settings.currentTheme = themeId
    this.saveSettings()
    
    console.log(`Theme applied: ${theme.displayName}`)
    return true
  }

  // Apply CSS variables for theme
  private applyCSSVariables(theme: Theme): void {
    const root = document.documentElement
    
    // Apply color variables
    root.style.setProperty('--color-primary', theme.colors.primary)
    root.style.setProperty('--color-secondary', theme.colors.secondary)
    root.style.setProperty('--color-accent', theme.colors.accent)
    root.style.setProperty('--color-background', theme.colors.background)
    root.style.setProperty('--color-surface', theme.colors.surface)
    root.style.setProperty('--color-text', theme.colors.text)
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--color-border', theme.colors.border)
    root.style.setProperty('--color-error', theme.colors.error)
    root.style.setProperty('--color-warning', theme.colors.warning)
    root.style.setProperty('--color-success', theme.colors.success)
    root.style.setProperty('--color-info', theme.colors.info)
    
    // Apply font variables
    root.style.setProperty('--font-primary', theme.fonts.primary)
    root.style.setProperty('--font-secondary', theme.fonts.secondary)
    root.style.setProperty('--font-mono', theme.fonts.mono)
    
    // Apply spacing variables
    root.style.setProperty('--spacing-xs', theme.spacing.xs)
    root.style.setProperty('--spacing-sm', theme.spacing.sm)
    root.style.setProperty('--spacing-md', theme.spacing.md)
    root.style.setProperty('--spacing-lg', theme.spacing.lg)
    root.style.setProperty('--spacing-xl', theme.spacing.xl)
    
    // Apply border radius variables
    root.style.setProperty('--radius-sm', theme.borderRadius.sm)
    root.style.setProperty('--radius-md', theme.borderRadius.md)
    root.style.setProperty('--radius-lg', theme.borderRadius.lg)
    root.style.setProperty('--radius-xl', theme.borderRadius.xl)
    
    // Apply shadow variables
    root.style.setProperty('--shadow-sm', theme.shadows.sm)
    root.style.setProperty('--shadow-md', theme.shadows.md)
    root.style.setProperty('--shadow-lg', theme.shadows.lg)
    root.style.setProperty('--shadow-xl', theme.shadows.xl)
    
    // Set theme class on body
    document.body.className = `theme-${theme.id}`
  }

  // Auto-switch theme based on system preferences
  autoSwitchTheme(): void {
    if (this.settings.autoSwitch) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const targetTheme = prefersDark ? 'dark' : 'light'
      
      if (this.settings.currentTheme !== targetTheme) {
        this.applyTheme(targetTheme)
      }
    }
  }

  // Toggle dark mode
  toggleDarkMode(): boolean {
    const newTheme = this.settings.currentTheme === 'dark' ? 'light' : 'dark'
    return this.applyTheme(newTheme)
  }

  // Update accessibility settings
  updateAccessibilitySettings(settings: Partial<AccessibilitySettings>): void {
    this.settings.accessibility = { ...this.settings.accessibility, ...settings }
    this.saveSettings()
    this.applyAccessibilitySettings()
    console.log('Accessibility settings updated')
  }

  // Apply accessibility settings
  private applyAccessibilitySettings(): void {
    const root = document.documentElement
    
    // High contrast
    if (this.settings.accessibility.highContrast) {
      root.style.setProperty('--contrast-high', '1')
      root.classList.add('high-contrast')
    } else {
      root.style.setProperty('--contrast-high', '0')
      root.classList.remove('high-contrast')
    }
    
    // Reduce motion
    if (this.settings.accessibility.reduceMotion) {
      root.style.setProperty('--motion-reduced', '1')
      root.classList.add('reduce-motion')
    } else {
      root.style.setProperty('--motion-reduced', '0')
      root.classList.remove('reduce-motion')
    }
    
    // Screen reader optimizations
    if (this.settings.accessibility.screenReader) {
      root.setAttribute('aria-live', 'polite')
      root.setAttribute('role', 'application')
    }
    
    // Focus visible
    if (this.settings.accessibility.focusVisible) {
      root.style.setProperty('--focus-visible', '1')
    } else {
      root.style.setProperty('--focus-visible', '0')
    }
    
    // Large text
    if (this.settings.accessibility.largeText) {
      root.style.setProperty('--text-scale', '1.2')
      root.classList.add('large-text')
    } else {
      root.style.setProperty('--text-scale', '1.0')
      root.classList.remove('large-text')
    }
    
    // Color blind mode
    if (this.settings.accessibility.colorBlindMode) {
      root.classList.add('color-blind-mode')
      // Apply color blind friendly palette
      this.applyColorBlindPalette()
    } else {
      root.classList.remove('color-blind-mode')
    }
  }

  // Apply color blind friendly palette
  private applyColorBlindPalette(): void {
    const root = document.documentElement
    
    // Color blind friendly colors
    const colorBlindColors: Record<string, string> = {
      primary: '#0066cc', // Blue
      secondary: '#ff6600', // Amber
      accent: '#00cc66', // Green
      error: '#cc0000', // Red
      warning: '#ff6600', // Amber
      success: '#00cc66', // Green
      info: '#0066cc' // Blue
    }
    
    Object.keys(colorBlindColors).forEach(key => {
      const cssVar = `--color-${key.replace('_', '-')}`
      root.style.setProperty(cssVar, colorBlindColors[key])
    })
  }

  // Get theme settings
  getSettings(): ThemeSettings {
    return this.settings
  }

  // Update theme settings
  updateSettings(newSettings: Partial<ThemeSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    
    // Apply theme if changed
    if (newSettings.currentTheme && newSettings.currentTheme !== this.settings.currentTheme) {
      this.applyTheme(newSettings.currentTheme)
    }
    
    // Apply accessibility settings if changed
    if (newSettings.accessibility) {
      this.applyAccessibilitySettings()
    }
  }

  // Get service status
  getStatus(): {
    currentTheme: string
    availableThemes: Theme[]
    isInitialized: boolean
    autoSwitch: boolean
  } {
    return {
      currentTheme: this.settings.currentTheme,
      availableThemes: this.getAllThemes(),
      isInitialized: this.isInitialized,
      autoSwitch: this.settings.autoSwitch
    }
  }

  // Cleanup resources
  dispose(): void {
    this.themes.clear()
    this.isInitialized = false
    console.log('Theme service disposed')
  }
}

// Export singleton instance
export const themeService = new ThemeService()
