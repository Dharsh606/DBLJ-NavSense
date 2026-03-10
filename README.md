# DBLJ NavSense - AI Navigation Assistant

**Sense the Path. Navigate the World.**

DBLJ NavSense is a comprehensive AI-powered navigation assistant designed specifically for visually impaired users. The application provides real-time navigation guidance, obstacle detection, and accessibility features using modern web technologies and device APIs.

## 🚀 Features

### 🗺️ Real Navigation System
- **Google Maps Integration**: Real-time map rendering and route calculation
- **GPS Location Tracking**: Accurate position tracking and turn-by-turn directions
- **Voice Guidance**: Spoken navigation instructions with customizable settings
- **Route Optimization**: Walking-friendly routes with accessibility options

### 👁️ AR Camera Detection
- **Real-time Object Detection**: Identifies obstacles like people, vehicles, chairs, doors
- **TensorFlow.js Integration**: Advanced AI model for accurate detection
- **Distance Estimation**: Approximates distance to detected objects
- **Voice Warnings**: Audio alerts for nearby obstacles
- **Visual Overlays**: Bounding boxes and labels on detected objects

### 🎤 Voice Command System
- **Natural Language Processing**: Intuitive voice commands
- **Hands-free Operation**: Complete control without touching the screen
- **Command Recognition**: Supports navigation, camera, emergency, and settings commands
- **Voice Feedback**: Confirms actions with spoken responses

### 📱 Bluetooth Device Support
- **Device Management**: Connect and manage assistive Bluetooth devices
- **Auto-connect**: Automatic pairing with saved devices
- **Battery Monitoring**: Track device battery levels and signal strength
- **Device Testing**: Test connections and functionality

### 🆘 Emergency Assistance
- **SOS Alert System**: One-tap emergency alert with location sharing
- **Emergency Contacts**: Quick access to saved emergency contacts
- **Location Sharing**: Automatic GPS location transmission
- **Alert Sounds**: Audio alerts for emergency situations

### ⚙️ Accessibility Features
- **Screen Reader Support**: Full compatibility with screen readers
- **Large Text Mode**: Increased font sizes for better readability
- **High Contrast Mode**: Enhanced visibility for low vision users
- **Vibration Alerts**: Tactile feedback when available
- **Voice-first Design**: Complete voice control capability

### 📊 Navigation History
- **Route Tracking**: Records all navigation sessions
- **Statistics**: Distance traveled, time spent, and route analysis
- **Export Options**: Download navigation history data
- **Search & Filter**: Find specific routes quickly

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: Modern React framework with server-side rendering
- **React 18**: Component-based UI development
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions

### Maps & Navigation
- **Google Maps JavaScript API**: Real-time mapping and routing
- **Geolocation API**: GPS location tracking
- **Places API**: Location search and autocomplete

### AI & Machine Learning
- **TensorFlow.js**: Browser-based machine learning
- **COCO-SSD Model**: Object detection for obstacle recognition
- **Web Neural Network API**: Hardware acceleration for AI models

### Device APIs
- **Web Speech API**: Voice recognition and text-to-speech
- **Web Bluetooth API**: Bluetooth device connectivity
- **MediaDevices API**: Camera access and management
- **Vibration API**: Tactile feedback support
- **Geolocation API**: GPS positioning

### Storage & Data
- **LocalStorage**: User settings and preferences
- **IndexedDB**: Navigation history and cached data
- **SessionStorage**: Temporary application state

## 📱 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- Modern web browser with ES6+ support
- Google Maps API key

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dblj-navsense.git
   cd dblj-navsense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your Google Maps API key:
   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 🔧 Configuration

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Create an API key with appropriate restrictions
5. Add the API key to your `.env.local` file

### Environment Variables

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🌐 Browser Compatibility

### Supported Browsers
- **Chrome 90+**: Full feature support
- **Firefox 88+**: Full feature support
- **Safari 14+**: Full feature support
- **Edge 90+**: Full feature support

### Mobile Support
- **iOS Safari 14+**: Full mobile optimization
- **Chrome Mobile**: Full mobile optimization
- **Samsung Internet**: Full mobile optimization

### Required Permissions
- Location access (GPS)
- Camera access (for obstacle detection)
- Microphone access (for voice commands)
- Bluetooth access (for device connectivity)

## 📖 Usage Guide

### Getting Started

1. **Grant Permissions**: Allow location, camera, and microphone access when prompted
2. **Set Up Voice**: Configure voice settings in the Settings screen
3. **Add Emergency Contacts**: Set up emergency contacts in the Emergency screen
4. **Test Features**: Try navigation, camera detection, and voice commands

### Navigation

1. **Start Navigation**: Tap "Start Navigation" or say "Open navigation"
2. **Enter Destination**: Type or speak your destination
3. **Follow Guidance**: Listen to voice instructions and follow the route
4. **Control Navigation**: Use pause, repeat, and stop buttons as needed

### Camera Detection

1. **Activate Camera**: Tap "AR Camera Detection" or say "Start camera"
2. **Point Forward**: Hold your device facing forward
3. **Listen for Warnings**: Voice alerts will indicate nearby obstacles
4. **View Detections**: See bounding boxes around detected objects

### Voice Commands

- "Open navigation" - Start navigation
- "Start camera" - Begin obstacle detection
- "Where am I" - Get current location
- "Emergency" - Trigger emergency alert
- "Open settings" - Access settings
- "Stop navigation" - End current navigation

## 🔒 Privacy & Security

### Data Collection
- **Location Data**: Only used for real-time navigation, not stored permanently
- **Camera Data**: Processed locally on device, not transmitted
- **Voice Data**: Processed locally, not recorded or stored
- **Usage Analytics**: Optional anonymous usage statistics

### Security Measures
- **API Key Protection**: Google Maps API key secured with domain restrictions
- **Local Storage**: Sensitive data stored locally on device
- **HTTPS Required**: Secure connection for all API calls
- **Permission Controls**: Granular permission management

## 🤝 Contributing

We welcome contributions to improve DBLJ NavSense! Here's how you can help:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request with detailed description

### Areas for Contribution

- **Accessibility Improvements**: Enhance screen reader support
- **New Languages**: Add voice command support for more languages
- **Additional Features**: Suggest and implement new navigation features
- **Bug Fixes**: Report and fix issues
- **Documentation**: Improve guides and documentation

### Code Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Write comprehensive tests
- Maintain accessibility standards
- Document complex functions

## 🐛 Troubleshooting

### Common Issues

**Navigation not working**
- Check internet connection
- Verify Google Maps API key
- Ensure location services are enabled

**Camera detection fails**
- Grant camera permissions
- Check camera hardware
- Ensure sufficient lighting

**Voice commands not recognized**
- Grant microphone permissions
- Speak clearly and reduce background noise
- Check supported browsers

**Bluetooth connection issues**
- Enable Bluetooth on device
- Check device compatibility
- Restart Bluetooth service

### Performance Optimization

- Use modern browsers for best performance
- Keep device charged during navigation
- Close unnecessary background apps
- Update browser to latest version

## 📞 Support

### Getting Help

- **User Guide**: Access comprehensive help in the app
- **Voice Help**: Say "Help" or "Open help" for voice assistance
- **Emergency Support**: Use SOS button for immediate assistance
- **Community Forum**: Join our user community for tips and support

### Contact Information

- **Email Support**: support@dbljnavsense.com
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Full documentation at docs.dbljnavsense.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Maps**: For mapping and navigation services
- **TensorFlow**: For machine learning capabilities
- **Lucide Icons**: For beautiful iconography
- **Framer Motion**: For smooth animations
- **Accessibility Community**: For guidance and feedback

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/dblj-navsense&type=Date)](https://star-history.com/#your-username/dblj-navsense&Date)

---

**DBLJ NavSense** - Empowering independent navigation through AI technology.

Made with ❤️ for the visually impaired community.
