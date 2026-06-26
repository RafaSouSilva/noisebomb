import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NeonButton } from "@/components/NeonButton";
import { neon } from "@/constants/colors";
import { usePremium } from "@/contexts/PremiumContext";

const PERKS = [
  { icon: "microphone", text: "Gravador de voz (at\u00e9 15s)" },
  { icon: "block-helper", text: "Remover todos os an\u00fancios" },
  { icon: "infinity", text: "Sons ilimitados em loop" },
  { icon: "timer-outline", text: "Temporizador de pegadinhas" },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPremium, price, goPremium, resetPremium } = usePremium();
  const [processing, setProcessing] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const displayPrice = price.amount;

  async function handlePay() {
    setProcessing(true);
    try {
      await goPremium();
    } catch (e: any) {
      Alert.alert(
        "Erro na compra",
        e?.message || "N\u00e3o foi poss\u00edvel processar. Tente novamente.",
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable testID="checkout-close" onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="chevron-down" size={26} color={neon.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={[neon.gold, "#ff6b35"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <MaterialCommunityIcons name="crown" size={22} color="#08080d" />
        </LinearGradient>

        <Text style={styles.title}>NoiseBomb Premium</Text>
        <Text style={styles.subtitle}>Desbloqueie o poder total do caos.</Text>

        <View style={styles.perks}>
          {PERKS.map((p) => (
            <View key={p.text} style={styles.perkRow}>
              <MaterialCommunityIcons name={p.icon as any} size={20} color={neon.gold} />
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.price}>{displayPrice}</Text>
        <Text style={styles.priceNote}>Pagamento \u00fanico via Google Play. Sem assinatura.</Text>

        <Text style={styles.comingSoon}>Em breve: mais sons na plataforma!</Text>

        {isPremium ? (
          <View style={styles.premiumBadge}>
            <MaterialCommunityIcons name="check-circle" size={20} color={neon.lime} />
            <Text style={styles.premiumText}>Voc\u00ea j\u00e1 \u00e9 Premium!</Text>
            <Pressable onPress={resetPremium} style={styles.resetBtn}>
              <Text style={styles.resetText}>Resetar (teste)</Text>
            </Pressable>
          </View>
        ) : (
          <NeonButton
            label={processing ? "Processando..." : `Comprar \u2014 ${displayPrice}`}
            onPress={handlePay}
            disabled={processing}
            colors={[neon.gold, "#ff6b35"]}
            style={styles.buyBtn}
          />
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12 }]}>
        <Text style={styles.footerText}>
          O pagamento \u00e9 processado de forma segura pelo Google Play. Em caso de problemas, contate-nos pelo e-mail de suporte.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#08080d",
  },
  header: {
    alignItems: "center",
    paddingBottom: 8,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: neon.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: neon.textMuted,
    marginTop: 6,
    textAlign: "center",
  },
  perks: {
    width: "100%",
    marginTop: 28,
    gap: 14,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  perkText: {
    fontSize: 15,
    color: neon.text,
  },
  price: {
    fontSize: 36,
    fontWeight: "800",
    color: neon.gold,
    marginTop: 32,
  },
  priceNote: {
    fontSize: 13,
    color: neon.textMuted,
    marginTop: 4,
  },
  comingSoon: {
    fontSize: 12,
    color: neon.cyan,
    marginTop: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  buyBtn: {
    marginTop: 28,
    width: "100%",
  },
  premiumBadge: {
    marginTop: 28,
    alignItems: "center",
    gap: 8,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: "600",
    color: neon.lime,
  },
  resetBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  resetText: {
    fontSize: 12,
    color: neon.textMuted,
  },
  footer: {
    paddingHorizontal: 28,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    color: neon.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },
});
