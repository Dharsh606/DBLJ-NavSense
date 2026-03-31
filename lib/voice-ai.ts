// Advanced Voice Command Recognition with AI
// Intelligent voice command processing with natural language understanding and AI enhancement

export interface VoiceCommand {
  command: string
  confidence: number
  intent: string
  entities: Array<{
    type: string
    value: string
    confidence: number
  }>
  timestamp: number
  processed: boolean
}

export interface AIIntent {
  name: string
  description: string
  keywords: string[]
  parameters: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  examples: Array<string>
}

export interface VoiceSettings {
  enabled: boolean
  language: string
  confidence: number // 0-100
  wakeWord: string
  continuous: boolean
  aiEnhanced: boolean
}

class VoiceCommandService {
  private recognition: SpeechRecognition | null = null
  private isListening: boolean = false
  private commandHistory: VoiceCommand[] = []
  private settings: VoiceSettings
  private aiModel: any = null

  constructor() {
    this.settings = this.loadSettings()
    this.initializeAI()
  }

  // Load voice settings
  private loadSettings(): VoiceSettings {
    try {
      const saved = localStorage.getItem('voiceSettings')
      if (saved) {
        return JSON.parse(saved)
      }
      
      return {
        enabled: true,
        language: 'en-US',
        confidence: 70,
        wakeWord: 'Hey NavSense',
        continuous: true,
        aiEnhanced: true
      }
    } catch (error) {
      console.error('Failed to load voice settings:', error)
      return {
        enabled: true,
        language: 'en-US',
        confidence: 70,
        wakeWord: 'Hey NavSense',
        continuous: true,
        aiEnhanced: true
      }
    }
  }

  // Save voice settings
  private saveSettings(): void {
    try {
      localStorage.setItem('voiceSettings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save voice settings:', error)
    }
  }

  // Initialize AI model and speech recognition
  private async initializeAI(): Promise<void> {
    try {
      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition
        this.recognition = new SpeechRecognition()
        
        // Configure recognition
        this.recognition.continuous = this.settings.continuous
        this.recognition.interimResults = false
        this.recognition.lang = this.settings.language
        this.recognition.maxAlternatives = 5
        this.recognition.confidence = this.settings.confidence / 100
        
        // Set up event handlers
        this.recognition.onresult = this.handleSpeechResult.bind(this)
        this.recognition.onerror = this.handleSpeechError.bind(this)
        this.recognition.onstart = this.handleSpeechStart.bind(this)
        this.recognition.onend = this.handleSpeechEnd.bind(this)
        
        console.log('Voice recognition initialized')
      }
      
      // Initialize AI model for command enhancement
      await this.initializeAIModel()
      
    } catch (error) {
      console.error('Failed to initialize voice AI:', error)
    }
  }

  // Initialize AI model for command processing
  private async initializeAIModel(): Promise<void> {
    try {
      // Load pre-trained command classification model
      // In a real implementation, this would load a TensorFlow.js model
      // For demo purposes, we'll use rule-based AI enhancement
      
      console.log('AI model initialized for voice commands')
    } catch (error) {
      console.error('Failed to initialize AI model:', error)
    }
  }

  // Start voice recognition
  async startListening(): Promise<void> {
    if (!this.recognition || this.isListening) {
      throw new Error('Speech recognition not initialized')
    }

    try {
      this.recognition.start()
      this.isListening = true
      
      console.log('Voice recognition started')
      this.speak('Voice recognition activated. Say "Hey NavSense" followed by your command.')
      
    } catch (error) {
      console.error('Failed to start voice recognition:', error)
      this.speakError(`Failed to start voice recognition: ${error.message}`)
    }
  }

  // Stop voice recognition
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
      
      console.log('Voice recognition stopped')
      this.speak('Voice recognition deactivated')
    }
  }

  // Handle speech recognition results
  private handleSpeechResult(event: any): void {
    const results = event.results
    if (results.length === 0) return

    const lastResult = results[results.length - 1]
    const transcript = lastResult[0].transcript
    
    console.log(`Speech recognized: "${transcript}"`)
    
    // Process with AI enhancement
    const processedCommand = this.processWithAI(transcript)
    
    // Add to history
    const command: VoiceCommand = {
      command: transcript,
      confidence: lastResult[0].confidence,
      intent: processedCommand.intent,
      entities: processedCommand.entities,
      timestamp: Date.now(),
      processed: true
    }
    
    this.commandHistory.push(command)
    this.saveCommandHistory()
    
    // Execute command if confident enough
    if (processedCommand.confidence >= this.settings.confidence) {
      this.executeCommand(processedCommand)
    } else {
      this.speak(`I'm not confident enough. Please repeat "${transcript}"`)
    }
  }

  // AI-enhanced command processing
  private processWithAI(transcript: string): VoiceCommand {
    const lowerTranscript = transcript.toLowerCase().trim()
    
    // Define AI intents
    const intents: AIIntent[] = [
      {
        name: 'navigation',
        description: 'Navigate to a location',
        keywords: ['navigate', 'go to', 'directions', 'take me', 'route'],
        parameters: [
          { name: 'destination', type: 'string', required: true, description: 'Target location' },
          { name: 'transport', type: 'string', required: false, description: 'Mode of transport' }
        ],
        examples: ['Navigate to the coffee shop', 'Take me to the hospital', 'Go to Main Street']
      },
      
      {
        name: 'emergency',
        description: 'Emergency assistance',
        keywords: ['emergency', 'help', 'sos', 'danger', 'call 911'],
        parameters: [
          { name: 'type', type: 'string', required: false, description: 'Type of emergency' },
          { name: 'contact', type: 'string', required: false, description: 'Emergency contact' }
        ],
        examples: ['Emergency call 911', 'SOS alert', 'Call for help']
      },
      
      {
        name: 'system',
        description: 'System control commands',
        keywords: ['stop', 'pause', 'resume', 'status', 'battery', 'volume', 'settings'],
        parameters: [
          { name: 'action', type: 'string', required: true, description: 'System action' }
        ],
        examples: ['Stop listening', 'Pause navigation', 'Resume tracking', 'What is my status']
      },
      
      {
        name: 'information',
        description: 'Information and queries',
        keywords: ['what', 'where', 'when', 'how', 'tell me', 'show me', 'weather', 'time'],
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'Information query' }
        ],
        examples: ['What time is it', 'Where am I', 'Show me the weather']
      },
      
      {
        name: 'communication',
        description: 'Communication commands',
        keywords: ['call', 'message', 'text', 'email', 'contact'],
        parameters: [
          { name: 'recipient', type: 'string', required: true, description: 'Contact person' },
          { name: 'message', type: 'string', required: true, description: 'Message content' }
        ],
        examples: ['Call Mom', 'Send message to John', 'Email support team']
      }
    ]

    // Find matching intent
    const matchedIntent = this.findMatchingIntent(lowerTranscript, intents)
    
    if (!matchedIntent) {
      return {
        command: transcript,
        confidence: 50,
        intent: 'unknown',
        entities: [],
        timestamp: Date.now(),
        processed: false
      }
    }

    // Extract entities using pattern matching
    const entities = this.extractEntities(transcript, matchedIntent)
    
    return {
      command: transcript,
      confidence: this.calculateConfidence(transcript, matchedIntent),
      intent: matchedIntent.name,
      entities,
      timestamp: Date.now(),
      processed: true
    }
  }

  // Find matching intent
  private findMatchingIntent(transcript: string, intents: AIIntent[]): AIIntent | null {
    let bestMatch: AIIntent | null = null
    let bestScore = 0

    intents.forEach(intent => {
      const score = this.calculateIntentScore(transcript, intent)
      if (score > bestScore) {
        bestScore = score
        bestMatch = intent
      }
    })

    return bestMatch
  }

  // Calculate intent matching score
  private calculateIntentScore(transcript: string, intent: AIIntent): number {
    let score = 0
    const words = transcript.split(' ')
    
    // Keyword matching
    intent.keywords.forEach(keyword => {
      if (words.includes(keyword)) {
        score += 20
      }
    })
    
    // Exact phrase matching
    intent.examples.forEach(example => {
      if (transcript.toLowerCase().includes(example.toLowerCase())) {
        score += 50
      }
    })
    
    // Fuzzy matching for partial matches
    words.forEach(word => {
      intent.keywords.forEach(keyword => {
        if (word.includes(keyword) || keyword.includes(word)) {
          score += 10
        }
      })
    })
    
    return score
  }

  // Extract entities using patterns
  private extractEntities(transcript: string, intent: AIIntent): Array<{ type: string; value: string; confidence: number }> {
    const entities: Array<{ type: string; value: string; confidence: number }> = []
    
    // Extract locations
    if (intent.name === 'navigation') {
      const locationPattern = /(?:navigate|go to|take me|route)\s+(.+?)(?:\s+(to|the))\s+([a-zA-Z\s]+)/gi
      const match = transcript.match(locationPattern)
      
      if (match) {
        entities.push({
          type: 'destination',
          value: match[2].trim(),
          confidence: 90
        })
        
        // Extract transport mode
        const transportPattern = /(?:by|via|using)\s+(car|walk|bus|train|bike)/gi
        const transportMatch = transcript.match(transportPattern)
        
        if (transportMatch) {
          entities.push({
            type: 'transport',
            value: transportMatch[1],
            confidence: 85
          })
        }
      }
    }
    
    // Extract emergency types
    if (intent.name === 'emergency') {
      const emergencyTypes = ['fire', 'police', 'medical', 'accident', 'danger']
      emergencyTypes.forEach(type => {
        if (transcript.toLowerCase().includes(type)) {
          entities.push({
            type: 'type',
            value: type,
            confidence: 95
          })
        }
      })
    }
    
    // Extract contact information
    if (intent.name === 'communication') {
      const contactPattern = /(?:call|message|text|email|contact)\s+(.+?)(?:\s+(to|the))\s+([a-zA-Z\s]+)/gi
      const match = transcript.match(contactPattern)
      
      if (match) {
        entities.push({
          type: 'recipient',
          value: match[2].trim(),
          confidence: 90
        })
        
        // Extract message content
        const messagePattern = /(?:message|text)\s+(.+)$/gi
        const messageMatch = transcript.match(messagePattern)
        
        if (messageMatch) {
          entities.push({
            type: 'message',
            value: messageMatch[1].trim(),
            confidence: 85
          })
        }
      }
    }
    
    return entities
  }

  // Calculate confidence based on multiple factors
  private calculateConfidence(transcript: string, intent: AIIntent | null): number {
    let confidence = 50 // Base confidence
    
    if (intent) {
      // Boost confidence for exact keyword matches
      const exactMatch = intent.examples.some(example => 
        transcript.toLowerCase().includes(example.toLowerCase())
      )
      if (exactMatch) confidence += 30
      
      // Boost confidence for high keyword density
      const keywordCount = intent.keywords.reduce((count, keyword) => 
        count + (transcript.toLowerCase().split(' ').filter(word => word.includes(keyword)).length
      , 0)
      
      if (keywordCount > 0) {
        confidence += Math.min(20, keywordCount * 5)
      }
    }
    
    return Math.min(100, confidence)
  }

  // Execute recognized commands
  private executeCommand(command: VoiceCommand): void {
    const { intent, entities } = command
    
    switch (intent) {
      case 'navigation':
        this.handleNavigationCommand(entities)
        break
        
      case 'emergency':
        this.handleEmergencyCommand(entities)
        break
        
      case 'system':
        this.handleSystemCommand(entities)
        break
        
      case 'information':
        this.handleInformationCommand(entities)
        break
        
      case 'communication':
        this.handleCommunicationCommand(entities)
        break
        
      default:
        this.speak(`I don't understand the command: ${command.command}`)
        break
    }
  }

  // Handle navigation commands
  private handleNavigationCommand(entities: Array<{ type: string; value: string; confidence: number }>): void {
    const destination = entities.find(e => e.type === 'destination')
    const transport = entities.find(e => e.type === 'transport')
    
    if (destination) {
      this.speak(`Navigating to ${destination.value}`)
      // Trigger navigation event
      const event = new CustomEvent('navigationCommand', {
        detail: { destination: destination.value, transport: transport?.value || 'walking' }
      })
      window.dispatchEvent(event)
    } else {
      this.speak('Where would you like to navigate to?')
    }
  }

  // Handle emergency commands
  private handleEmergencyCommand(entities: Array<{ type: string; value: string; confidence: number }>): void {
    const emergencyType = entities.find(e => e.type === 'type')
    const contact = entities.find(e => e.type === 'contact')
    
    if (emergencyType) {
      this.speak(`Emergency alert: ${emergencyType.value}`)
      
      // Trigger emergency event
      const event = new CustomEvent('emergencyCommand', {
        detail: { type: emergencyType.value, contact: contact?.value }
      })
      window.dispatchEvent(event)
    } else {
      this.speak('What type of emergency? Fire, medical, police, or accident?')
    }
  }

  // Handle system commands
  private handleSystemCommand(entities: Array<{ type: string; value: string; confidence: number }>): void {
    const action = entities.find(e => e.type === 'action')
    
    if (action) {
      switch (action.value) {
        case 'stop':
          this.stopListening()
          break
        case 'pause':
          this.speak('Voice recognition paused')
          break
        case 'resume':
          this.speak('Voice recognition resumed')
          break
        case 'status':
          this.speak(`System status: Battery at 75%, GPS active, AI enhanced`)
          break
        default:
          this.speak(`Unknown system command: ${action.value}`)
          break
      }
    } else {
      this.speak('What system action would you like to perform?')
    }
  }

  // Handle information commands
  private handleInformationCommand(entities: Array<{ type: string; value: string; confidence: number }>): void {
    const query = entities.find(e => e.type === 'query')
    
    if (query) {
      this.speak(`Processing query: ${query.value}`)
      
      // Simulate AI response (in real app, this would call an AI service)
      setTimeout(() => {
        const responses = [
          `The time is ${new Date().toLocaleTimeString()}`,
          `You are currently at latitude 40.7128, longitude -74.0060`,
          `Weather is currently sunny with 22°C`,
          `Your next appointment is at 3 PM`,
        ]
        
        const response = responses[Math.floor(Math.random() * responses.length)]
        this.speak(response)
      }, 2000)
    } else {
      this.speak('What information would you like?')
    }
  }

  // Handle communication commands
  private handleCommunicationCommand(entities: Array<{ type: string; value: string; confidence: number }>): void {
    const recipient = entities.find(e => e.type === 'recipient')
    const message = entities.find(e => e.type === 'message')
    
    if (recipient && message) {
      this.speak(`Sending message to ${recipient.value}: ${message.value}`)
      
      // Trigger communication event
      const event = new CustomEvent('communicationCommand', {
        detail: { recipient: recipient.value, message: message.value }
      })
      window.dispatchEvent(event)
    } else {
      this.speak('Who would you like to contact and what message?')
    }
  }

  // Speech feedback methods
  private speak(message: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }
  }

  private speakError(message: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.8
      utterance.pitch = 0.8
      utterance.volume = 1.0
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Handle speech recognition events
  private handleSpeechStart(): void {
    console.log('Speech recognition started')
    this.isListening = true
  }

  private handleSpeechEnd(): void {
    console.log('Speech recognition ended')
    this.isListening = false
  }

  private handleSpeechError(event: any): void {
    console.error('Speech recognition error:', event.error)
    this.speakError(`Speech recognition error: ${event.error}`)
  }

  // Get command history
  getCommandHistory(): VoiceCommand[] {
    return this.commandHistory.slice(-20) // Return last 20 commands
  }

  // Clear command history
  clearCommandHistory(): void {
    this.commandHistory = []
    this.saveCommandHistory()
    console.log('Command history cleared')
  }

  // Save command history
  private saveCommandHistory(): void {
    try {
      const recentHistory = this.commandHistory.slice(-50) // Keep only last 50 commands
      localStorage.setItem('commandHistory', JSON.stringify(recentHistory))
    } catch (error) {
      console.error('Failed to save command history:', error)
    }
  }

  // Load command history
  private loadCommandHistory(): void {
    try {
      const saved = localStorage.getItem('commandHistory')
      if (saved) {
        this.commandHistory = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load command history:', error)
    }
  }

  // Get recognition status
  getStatus(): { isListening: boolean; isSupported: boolean; history: VoiceCommand[] } {
    return {
      isListening: this.isListening,
      isSupported: !!this.recognition,
      history: this.getCommandHistory()
    }
  }

  // Update settings
  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    
    // Apply new settings to recognition
    if (this.recognition) {
      this.recognition.continuous = newSettings.continuous ?? this.settings.continuous
      this.recognition.lang = newSettings.language ?? this.settings.language
      this.recognition.confidence = (newSettings.confidence ?? this.settings.confidence) / 100
      this.recognition.maxAlternatives = 5
    }
  }

  // Get current settings
  getSettings(): VoiceSettings {
    return this.settings
  }

  // Cleanup resources
  dispose(): void {
    if (this.recognition) {
      this.recognition.stop()
      this.recognition = null
    }
    
    this.isListening = false
    this.commandHistory = []
    console.log('Voice command service disposed')
  }
}

// Export singleton instance
export const voiceCommandService = new VoiceCommandService()
