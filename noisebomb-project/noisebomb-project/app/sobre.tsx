import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { neon } from "@/constants/colors";


export default function SobreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="chevron-down" size={26} color={neon.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Sobre</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}>
        <LinearGradient
          colors={[neon.purple, neon.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <MaterialCommunityIcons name="bomb" size={36} color="#fff" />
        </LinearGradient>

        <Text style={styles.title}>NoiseBomb</Text>
        <Text style={styles.subtitle}>v1.0.0 • Prank Soundboard</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>
          <Pressable style={styles.linkRow} onPress={() => router.push("/privacidade")}>
            <MaterialCommunityIcons name="shield-account" size={20} color={neon.cyan} />
            <Text style={styles.linkText}>Política de Privacidade</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={neon.textFaint} />
          </Pressable>
          <Pressable style={styles.linkRow} onPress={() => router.push("/contato")}>
            <MaterialCommunityIcons name="email-outline" size={20} color={neon.cyan} />
            <Text style={styles.linkText}>Contato / Suporte</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={neon.textFaint} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissões</Text>
          <Text style={styles.bodyText}>
            <MaterialCommunityIcons name="microphone" size={14} color={neon.textMuted} /> Microfone — para gravar seus sons.
          </Text>
          <Text style={styles.bodyText}>
            <MaterialCommunityIcons name="volume-high" size={14} color={neon.textMuted} /> Áudio — para tocar sons e manter em background.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: neon.background },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: neon.cardBorder,
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
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 22,
    alignItems: "center",
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: neon.text,
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginTop: 4,
  },
  subtitle: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  section: {
    alignSelf: "stretch",
    gap: 10,
  },
  sectionTitle: {
    color: neon.textMuted,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: neon.card,
    borderWidth: 1,
    borderColor: neon.cardBorder,
    borderRadius: 14,
    padding: 14,
  },
  linkText: {
    flex: 1,
    color: neon.text,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  bodyText: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
});
