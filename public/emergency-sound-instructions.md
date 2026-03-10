# Emergency Alert Sound Instructions

## How to Add Your Custom Emergency Sound

1. **File Location**: `j:\AR-NAV-VI\public\emergency-alert.mp3`

2. **File Requirements**:
   - Format: MP3
   - Duration: 3-5 seconds (will loop continuously)
   - Volume: Loud and attention-grabbing
   - Content: Emergency alert sound (siren, alarm, etc.)

3. **Replace the placeholder**:
   - Remove the current `emergency-alert.mp3` file
   - Add your custom emergency sound file
   - Make sure it's named exactly `emergency-alert.mp3`

4. **Sound Behavior**:
   - Plays immediately when emergency is triggered
   - Loops continuously for 10 seconds
   - Maximum volume (1.0)
   - Auto-stops when emergency is cancelled or reset

5. **Additional Sounds**:
   - Warning sound plays when SOS is first activated (440 Hz tone)
   - Countdown beeps play at 3, 2, 1 seconds (800 Hz beeps)
   - Main emergency alert sound plays continuously during emergency

## Recommended Sound Types

- **Medical Alert**: Standard medical emergency beep
- **Siren**: Emergency vehicle siren
- **Alarm**: High-priority alarm tone
- **Custom**: Your branded emergency sound

## Testing

1. Add your sound file
2. Test the emergency feature
3. Ensure the sound plays immediately and loops properly
4. Verify sound stops when emergency is cancelled
