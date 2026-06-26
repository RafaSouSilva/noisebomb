import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "@noisebomb/recordings";

export interface Recording {
  id: string;
  name: string;
  uri: string;
  createdAt: number;
}

interface AudioContextValue {
  recordings: Recording[];
  addRecording: (rec: Recording) => Promise<void>;
  removeRecording: (id: string) => Promise<void>;
}

const AudioCtx = createContext<AudioContextValue | undefined>(undefined);

export function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

const PLAYBACK_AUDIO_MODE = {
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  interruptionModeIOS: InterruptionModeIOS.DuckOthers,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
} as const;

/** Restore the background-capable playback audio mode (e.g. after recording). */
export async function restorePlaybackAudioMode(): Promise<void> {
  try {
    await Audio.setAudioModeAsync(PLAYBACK_AUDIO_MODE);
  } catch {
    // ignore audio mode errors
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);

  // Configure background-capable audio playback once at startup.
  useEffect(() => {
    void restorePlaybackAudioMode();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setRecordings(JSON.parse(stored) as Recording[]);
      } catch {
        // ignore
      }
    })();
  }, []);

  const persist = useCallback(async (list: Recording[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }, []);

  const addRecording = useCallback(
    async (rec: Recording) => {
      setRecordings((prev) => {
        const next = [rec, ...prev];
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeRecording = useCallback(
    async (id: string) => {
      setRecordings((prev) => {
        const next = prev.filter((r) => r.id !== id);
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  return (
    <AudioCtx.Provider value={{ recordings, addRecording, removeRecording }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useRecordings(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useRecordings must be used within AudioProvider");
  return ctx;
}
