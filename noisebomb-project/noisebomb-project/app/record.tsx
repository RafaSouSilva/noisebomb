import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NeonButton } from "@/components/NeonButton";
import { neon } from "@/constants/colors";
import {
  genId,
  Recording,
  restorePlaybackAudioMode,
  useRecordings,
} from "@/contexts/AudioContext";
import { usePremium } from "@/contexts/PremiumContext";

const MAX_SECONDS = 15;

export default function RecordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addRecording } = useRecordings();
  const { isPremium } = usePremium();

  // The recorder is a Premium-only feature; block direct/deep-link access.
  useEffect(() => {
    if (!isPremium) {
      router.replace("/checkout");
    }
  }, [isPremium, router]);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const [status, setStatus] = useState<"idle" | "recording" | "done" | "denied">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (recordingRef.current) {
        // Stop the in-flight recording and restore playback audio mode so
        // dismissing the modal mid-recording doesn't leave the app in
        // recording mode (which would break background playback).
        void recordingRef.current
          .stopAndUnloadAsync()
          .catch(() => {})
          .finally(() => {
            void restorePlaybackAudioMode();
          });
      }
    };
  }, []);

  useEffect(() => {
    if (status === "recording") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.25, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(1);
    return undefined;
  }, [status, pulse]);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setStatus("denied");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setElapsed(0);
      setStatus("recording");
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      tickRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS) {
            void stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch {
      setStatus("idle");
    }
  }

  async function stopRecording() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    const rec = recordingRef.current;
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;
      // Restore playback-friendly audio mode after recording.
      await restorePlaybackAudioMode();
      if (uri) {
        setResultUri(uri);
        setStatus("done");
        if (Platform.OS !== "web") {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  }

  async function save() {
    if (!resultUri) return;
    setSaving(true);
    // expo-av writes the recording into the app's persistent storage
    // directory, so the returned URI is safe to keep as-is.
    const count = Date.now() % 1000;
    const rec: Recording = {
      id: genId(),
      name: `Gravação ${count}`,
      uri: resultUri,
      createdAt: Date.now(),
    };
    await addRecording(rec);
    setSaving(false);
    router.back();
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const remaining = MAX_SECONDS - elapsed;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable testID="record-close" onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="chevron-down" size={26} color={neon.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Gravar Som</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {status === "denied" ? (
          <View style={styles.center}>
            <MaterialCommunityIcons name="microphone-off" size={48} color={neon.danger} />
            <Text style={styles.deniedTitle}>Microfone bloqueado</Text>
            <Text style={styles.deniedSub}>
              Permita o acesso ao microfone nas configurações do dispositivo para
              gravar seus sons.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.timerBig}>
              {status === "done" ? "Pronto!" : `${remaining}s`}
            </Text>
            <Text style={styles.hint}>
              {status === "idle" && "Toque para gravar até 15 segundos"}
              {status === "recording" && "Gravando... toque para parar"}
              {status === "done" && "Ouça na aba Meus Sons depois de salvar"}
            </Text>

            <Animated.View style={{ transform: [{ scale: pulse }], marginTop: 50 }}>
              <Pressable
                testID="record-toggle"
                onPress={() => {
                  if (status === "recording") void stopRecording();
                  else if (status === "idle") void startRecording();
                }}
                disabled={status === "done"}
                style={[
                  styles.micBtn,
                  {
                    backgroundColor:
                      status === "recording" ? neon.danger : status === "done" ? neon.lime : neon.purple,
                    shadowColor: status === "recording" ? neon.danger : neon.purple,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={status === "recording" ? "stop" : status === "done" ? "check" : "microphone"}
                  size={56}
                  color="#fff"
                />
              </Pressable>
            </Animated.View>
          </>
        )}
      </View>

      {status === "done" ? (
        <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
          <Pressable
            testID="record-retry"
            onPress={() => {
              setResultUri(null);
              setElapsed(0);
              setStatus("idle");
            }}
            style={styles.retryBtn}
          >
            <MaterialCommunityIcons name="restart" size={18} color={neon.text} />
            <Text style={styles.retryText}>Regravar</Text>
          </Pressable>
          <NeonButton
            testID="record-save"
            label="Salvar Som"
            loading={saving}
            onPress={save}
            colors={[neon.lime, neon.cyan]}
            textColor="#08080d"
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: neon.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: neon.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: neon.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  timerBig: {
    color: neon.text,
    fontFamily: "Inter_700Bold",
    fontSize: 64,
  },
  hint: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
    marginTop: 6,
  },
  micBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  center: { alignItems: "center", gap: 12, paddingHorizontal: 20 },
  deniedTitle: {
    color: neon.text,
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  deniedSub: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: neon.cardBorder,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: neon.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 56,
  },
  retryText: {
    color: neon.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
