import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { useUserStore } from '../store/useUserStore';

const ALARM_SOUND_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Placeholder for irritating sound
const SIREN_URL = 'https://actions.google.com/sounds/v1/emergency/ambulance_siren.ogg';

export const useSystemAlarm = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const soundsEnabled = useUserStore(state => state.systemSettings.sounds);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const configureAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to set audio mode:', error);
    }
  };

  const playAlarm = async () => {
    if (!soundsEnabled) return;

    try {
      await configureAudio();
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: SIREN_URL },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Failed to play alarm:', error);
    }
  };

  const stopAlarm = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  return { playAlarm, stopAlarm };
};
