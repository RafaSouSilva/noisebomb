import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdBanner } from "@/components/AdBanner";
import { CategoryChips } from "@/components/CategoryChips";
import { SoundCard } from "@/components/SoundCard";
import { neon } from "@/constants/colors";
import { CategoryId, SOUNDS } from "@/constants/sounds";
import { useRecordings } from "@/contexts/AudioContext";
import { useAds } from "@/contexts/AdsContext";
import { usePremium } from "@/contexts/PremiumContext";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPremium } = usePremium();
  const { recordings, removeRecording } = useRecordings();
  const { showInterstitial, introShown } = useAds();

  const [category, setCategory] = useState<CategoryId>("animais");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const data = useMemo(
    () => (category === "meus" ? [] : SOUNDS.filter((s) => s.category === category)),
    [category],
  );

  const isMine = category === "meus";

  // Mostrar anúncio interstitial (vídeo) na abertura do app
  React.useEffect(() => {
    if (!isPremium && !introShown) {
      void showInterstitial();
    }
  }, [isPremium, introShown, showInterstitial]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#15071f", neon.background]}
        style={[styles.header, { paddingTop: topPad + 14 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <MaterialCommunityIcons name="bomb" size={28} color={neon.purple} />
            <Text style={styles.brand}>
              NOISE<Text style={{ color: neon.cyan }}>BOMB</Text>
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              onPress={() => router.push("/sobre")}
              style={[styles.infoBtn, { backgroundColor: neon.surface }]}>
              <MaterialCommunityIcons name="information" size={18} color={neon.textMuted} />
            </Pressable>
            <Pressable
              testID="premium-btn"
              onPress={() => router.push("/checkout")}
              style={[
                styles.premiumPill,
                isPremium && { borderColor: neon.gold, backgroundColor: neon.gold + "22" },
              ]}
            >
              <MaterialCommunityIcons
                name={isPremium ? "crown" : "crown-outline"}
                size={16}
                color={neon.gold}
              />
              <Text style={styles.premiumText}>{isPremium ? "PREMIUM" : "Upgrade"}</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.tagline}>Solte o caos. Pregue a peça.</Text>
      </LinearGradient>

      <View style={styles.chipsWrap}>
        <CategoryChips selected={category} onSelect={setCategory} />
      </View>

      {isMine ? (
        <MySoundsSection
          isPremium={isPremium}
          recordings={recordings}
          onRemove={removeRecording}
          onRecord={() => router.push("/record")}
          onUpgrade={() => router.push("/checkout")}
          bottomPad={bottomPad}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + (isPremium ? 24 : 90) }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SoundCard
              testID={`sound-${item.id}`}
              name={item.name}
              icon={item.icon}
              color={item.color}
              source={item.source}
              image={item.image}
            />
          )}
        />
      )}

      {!isPremium ? (
        <View style={[styles.adWrap, { paddingBottom: bottomPad + 8 }]}>
          <AdBanner onUpgrade={() => router.push("/checkout")} />
        </View>
      ) : null}
    </View>
  );
}

function MySoundsSection({
  isPremium,
  recordings,
  onRemove,
  onRecord,
  onUpgrade,
  bottomPad,
}: {
  isPremium: boolean;
  recordings: { id: string; name: string; uri: string }[];
  onRemove: (id: string) => void;
  onRecord: () => void;
  onUpgrade: () => void;
  bottomPad: number;
}) {
  if (!isPremium) {
    return (
      <View style={styles.locked}>
        <View style={styles.lockCircle}>
          <MaterialCommunityIcons name="lock" size={40} color={neon.gold} />
        </View>
        <Text style={styles.lockTitle}>Gravador Premium</Text>
        <Text style={styles.lockSub}>
          Grave seus próprios sons e use com loop, volume amplificado e
          temporizador. Disponível para membros Premium.
        </Text>
        <Pressable testID="unlock-record" onPress={onUpgrade} style={styles.unlockBtn}>
          <MaterialCommunityIcons name="crown" size={18} color="#08080d" />
          <Text style={styles.unlockText}>Desbloquear Premium</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="microphone-off" size={36} color={neon.textFaint} />
            <Text style={styles.emptyText}>Nenhum som gravado ainda</Text>
            <Text style={styles.emptySub}>Toque no botão abaixo para gravar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <SoundCard
            testID={`rec-${item.id}`}
            name={item.name}
            icon="waveform"
            color={neon.gold}
            source={{ uri: item.uri }}
            onDelete={() => onRemove(item.id)}
          />
        )}
      />
      <Pressable
        testID="record-fab"
        onPress={onRecord}
        style={[styles.fab, { bottom: bottomPad + 20 }]}
      >
        <LinearGradient
          colors={[neon.pink, neon.purple]}
          style={styles.fabGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="microphone" size={28} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: neon.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: neon.cardBorder,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: {
    color: neon.text,
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    letterSpacing: 1,
  },
  infoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: neon.cardBorder,
  },
  premiumPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: neon.gold + "66",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 36,
  },
  premiumText: {
    color: neon.gold,
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  tagline: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 10,
  },
  chipsWrap: { paddingVertical: 14 },
  list: { paddingHorizontal: 16, gap: 14 },
  adWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8,
    backgroundColor: neon.background + "f2",
  },
  locked: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 14,
  },
  lockCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: neon.gold + "66",
    backgroundColor: neon.gold + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  lockTitle: {
    color: neon.text,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  lockSub: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: neon.gold,
    borderRadius: 16,
    paddingHorizontal: 22,
    height: 52,
    marginTop: 8,
  },
  unlockText: {
    color: "#08080d",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingTop: 80,
  },
  emptyText: {
    color: neon.textMuted,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  emptySub: {
    color: neon.textFaint,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  fab: {
    position: "absolute",
    right: 20,
  },
  fabGrad: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: neon.pink,
    shadowOpacity: 0.7,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
});
