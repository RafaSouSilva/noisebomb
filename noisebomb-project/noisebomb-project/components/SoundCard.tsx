import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio, AVPlaybackSource } from "expo-av";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { neon } from "@/constants/colors";
import { TIMER_OPTIONS } from "@/constants/sounds";
import { usePremium } from "@/contexts/PremiumContext";
import { canUseLoopToday, canUseTimerToday, recordLoopUsage, recordTimerUsage } from "@/lib/freemium";

interface Props {
  name: string;
  icon: string;
  color: string;
  source: AVPlaybackSource;
  image?: any; // ImageSourcePropType compatible
  onDelete?: () => void;
  testID?: string;
}

const TIMER_KEY = (id: string) => `@noisebomb/timer/${id}`;

function haptic() {
  if (Platform.OS !== "web") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
}

export function SoundCard({ name, icon, color, source, image, onDelete, testID }: Props) {
  const { isPremium } = usePremium();
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);

  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(100); // 0 - 300 (%)
  const [loop, setLoop] = useState(false);
  const [timerPickerOpen, setTimerPickerOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [limitModal, setLimitModal] = useState<"loop" | "timer" | null>(null);

  // keep latest control values for delayed playback
  const volumeRef = useRef(volume);
  const loopRef = useRef(loop);
  volumeRef.current = volume;
  loopRef.current = loop;

  // Check for background timer on mount
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      const stored = await AsyncStorage.getItem(TIMER_KEY(testID ?? "unknown"));
      if (stored) {
        const target = parseInt(stored, 10);
        const now = Date.now();
        const remaining = Math.ceil((target - now) / 1000);
        if (remaining > 0) {
          setCountdown(remaining);
          timerRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev === null) return null;
              const now2 = Date.now();
              const left = Math.ceil((target - now2) / 1000);
              if (left <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = null;
                if (testID) {
                  void AsyncStorage.removeItem(TIMER_KEY(testID));
                }
                void startPlayback();
                return null;
              }
              return left;
            });
          }, 1000);
        } else {
          // Timer already expired while app was closed
          await AsyncStorage.removeItem(TIMER_KEY(testID ?? "unknown"));
          void startPlayback();
        }
      }
    })();
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundRef.current) {
        void soundRef.current.unloadAsync();
      }
    };
  }, [testID]);

  // expo-av clamps hardware volume to 1.0; values above 100% show "Amplificado".
  const hwVolume = Math.min(volume / 100, 1);

  async function unload() {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // ignore
      }
      soundRef.current = null;
    }
  }

  async function startPlayback() {
    if (startingRef.current) return;
    startingRef.current = true;
    setLoading(true);
    try {
      await unload();
      const { sound } = await Audio.Sound.createAsync(
        source,
        {
          shouldPlay: true,
          volume: Math.min(volumeRef.current / 100, 1),
          isLooping: loopRef.current,
        },
        (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish && !status.isLooping) {
            setPlaying(false);
          }
        },
      );
      if (!mountedRef.current) {
        await sound.unloadAsync().catch(() => {});
        return;
      }
      soundRef.current = sound;
      setPlaying(true);
    } catch {
      setPlaying(false);
    } finally {
      startingRef.current = false;
      setLoading(false);
    }
  }

  async function stopPlayback() {
    setPlaying(false);
    await unload();
  }

  function cancelTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    if (testID) {
      void AsyncStorage.removeItem(TIMER_KEY(testID));
    }
  }

  function scheduleTimer(seconds: number) {
    setTimerPickerOpen(false);
    haptic();
    if (seconds === 0) {
      void startPlayback();
      return;
    }
    cancelTimer();
    const target = Date.now() + seconds * 1000;
    setCountdown(seconds);
    if (testID) {
      void AsyncStorage.setItem(TIMER_KEY(testID), target.toString());
    }
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        const now = Date.now();
        const left = Math.ceil((target - now) / 1000);
        if (left <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          if (testID) {
            void AsyncStorage.removeItem(TIMER_KEY(testID));
          }
          void startPlayback();
          return null;
        }
        return left;
      });
    }, 1000);
  }

  function onMainPress() {
    haptic();
    if (playing) {
      void stopPlayback();
    } else {
      void startPlayback();
    }
  }

  async function onVolumeChange(v: number) {
    const rounded = Math.round(v);
    setVolume(rounded);
    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(Math.min(rounded / 100, 1));
      } catch {
        // ignore
      }
    }
  }

  async function toggleLoop() {
    const next = !loop;
    // Only consume freemium limit when turning ON loop
    if (next && !isPremium) {
      const ok = await canUseLoopToday();
      if (!ok) {
        setLimitModal("loop");
        return;
      }
      await recordLoopUsage();
    }
    setLoop(next);
    if (Platform.OS !== "web") void Haptics.selectionAsync();
    if (soundRef.current) {
      try {
        await soundRef.current.setIsLoopingAsync(next);
      } catch {
        // ignore
      }
    }
  }

  async function onTimerPress(seconds: number) {
    if (!isPremium) {
      const ok = await canUseTimerToday();
      if (!ok) {
        setLimitModal("timer");
        return;
      }
      await recordTimerUsage();
    }
    scheduleTimer(seconds);
  }

  const amplified = volume > 100;

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        { borderColor: playing ? color : neon.cardBorder, shadowColor: color, shadowOpacity: playing ? 0.6 : 0 },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: color + "1f", borderColor: color + "55" }]}>
          {image ? (
            <Image source={image as any} style={styles.iconImage} />
          ) : (
            <MaterialCommunityIcons name={icon as never} size={24} color={color} />
          )}
        </View>

        <View style={styles.nameCol}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.status, { color: playing ? color : neon.textFaint }]}>
            {playing ? (loop ? "Em loop" : "Tocando") : amplified ? "Amplificado" : "Pronto"}
          </Text>
        </View>

        <Pressable
          testID={`${testID}-play`}
          onPress={onMainPress}
          disabled={loading}
          style={[styles.playBtn, { backgroundColor: playing ? color : color + "22", borderColor: color }]}
        >
          {loading ? (
            <ActivityIndicator color={playing ? "#000" : color} size="small" />
          ) : (
            <MaterialCommunityIcons
              name={playing ? "stop" : "play"}
              size={26}
              color={playing ? "#08080d" : color}
            />
          )}
        </Pressable>
      </View>

      <View style={styles.sliderRow}>
        <MaterialCommunityIcons name="volume-high" size={18} color={neon.textMuted} />
        <Slider
          testID={`${testID}-volume`}
          style={styles.slider}
          minimumValue={0}
          maximumValue={300}
          value={volume}
          step={1}
          minimumTrackTintColor={amplified ? neon.pink : color}
          maximumTrackTintColor={neon.cardBorder}
          thumbTintColor={amplified ? neon.pink : color}
          onValueChange={onVolumeChange}
        />
        <Text style={[styles.volLabel, { color: amplified ? neon.pink : neon.textMuted }]}>
          {volume}%
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          testID={`${testID}-loop`}
          onPress={toggleLoop}
          style={[styles.actionBtn, loop && { backgroundColor: color + "22", borderColor: color }]}
        >
          <MaterialCommunityIcons name="repeat" size={16} color={loop ? color : neon.textMuted} />
          <Text style={[styles.actionText, { color: loop ? color : neon.textMuted }]}>Loop</Text>
        </Pressable>

        <Pressable
          testID={`${testID}-timer`}
          onPress={() => setTimerPickerOpen(true)}
          style={styles.actionBtn}
        >
          <MaterialCommunityIcons name="timer-outline" size={16} color={neon.textMuted} />
          <Text style={[styles.actionText, { color: neon.textMuted }]}>Timer</Text>
        </Pressable>

        {/* Freemium limit modal */}
        <Modal
          visible={limitModal !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setLimitModal(null)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setLimitModal(null)}>
            <Pressable style={styles.limitSheet}>
              <MaterialCommunityIcons name="lock" size={36} color={neon.gold} />
              <Text style={styles.limitTitle}>Limite diário atingido</Text>
              <Text style={styles.limitSub}>
                {limitModal === "loop"
                  ? "Você já usou o loop hoje. Vire Premium para usar ilimitado."
                  : "Você já usou o timer hoje. Vire Premium para usar ilimitado."}
              </Text>
              <Pressable
                onPress={() => setLimitModal(null)}
                style={[styles.limitBtn, { backgroundColor: neon.gold }]}
              >
                <Text style={[styles.limitBtnText, { color: "#08080d" }]}>Entendi</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {onDelete ? (
          <Pressable
            testID={`${testID}-delete`}
            onPress={() => {
              haptic();
              void stopPlayback();
              onDelete();
            }}
            style={styles.actionBtn}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={neon.danger} />
          </Pressable>
        ) : null}
      </View>

      {/* Timer picker */}
      <Modal
        visible={timerPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTimerPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setTimerPickerOpen(false)}>
          <Pressable style={styles.timerSheet}>
            <Text style={styles.sheetTitle}>Temporizador da Pegadinha</Text>
            <Text style={styles.sheetSub}>{name}</Text>
            <View style={styles.timerGrid}>
              {TIMER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.label}
                  testID={`timer-opt-${opt.seconds}`}
                  onPress={() => onTimerPress(opt.seconds)}
                  style={[styles.timerOpt, { borderColor: color + "66" }]}
                >
                  <Text style={[styles.timerOptText, { color }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Countdown overlay */}
      <Modal visible={countdown !== null} transparent animationType="fade">
        <View style={styles.countdownBackdrop}>
          <Text style={styles.countdownLabel}>Tocando em</Text>
          <Text style={[styles.countdownNum, { color }]}>{countdown ?? 0}</Text>
          <Text style={styles.countdownName}>{name}</Text>
          <Pressable testID="countdown-cancel" onPress={cancelTimer} style={styles.cancelBtn}>
            <MaterialCommunityIcons name="close" size={20} color={neon.text} />
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: neon.card,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    gap: 14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  nameCol: { flex: 1 },
  name: {
    color: neon.text,
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  status: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slider: { flex: 1, height: 34 },
  volLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    width: 46,
    textAlign: "right",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: neon.cardBorder,
    backgroundColor: neon.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 38,
  },
  actionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000000cc",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  timerSheet: {
    backgroundColor: neon.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: neon.cardBorder,
    padding: 22,
  },
  sheetTitle: {
    color: neon.text,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    textAlign: "center",
  },
  sheetSub: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 18,
  },
  timerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  timerOpt: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    width: "30%",
    alignItems: "center",
  },
  timerOptText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  countdownBackdrop: {
    flex: 1,
    backgroundColor: "#000000ee",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  countdownLabel: {
    color: neon.textMuted,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  countdownNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 120,
  },
  countdownName: {
    color: neon.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    marginBottom: 30,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: neon.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  cancelText: {
    color: neon.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  limitSheet: {
    backgroundColor: neon.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: neon.cardBorder,
    padding: 26,
    alignItems: "center",
    gap: 12,
  },
  limitTitle: {
    color: neon.text,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    textAlign: "center",
    marginTop: 4,
  },
  limitSub: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  limitBtn: {
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  limitBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
});
