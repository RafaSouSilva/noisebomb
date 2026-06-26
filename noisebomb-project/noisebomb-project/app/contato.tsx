import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { neon } from "@/constants/colors";

export default function ContatoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="chevron-down" size={26} color={neon.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Contato</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}>
        <Text style={styles.title}>Contato / Suporte</Text>
        <Text style={styles.subtitle}>
          Para d\u00favidas, sugest\u00f5es ou problemas com o NoiseBomb:
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <Text style={styles.bodyText}>rafaelsouzadasilva1982@gmail.com</Text>
          <Text style={styles.hint}>Respondemos em at\u00e9 48h \u00fateis.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <Text style={styles.bodyText}>NoiseBomb v1.0.0</Text>
          <Text style={styles.bodyText}>Plataforma: {Platform.OS}</Text>
          <Text style={styles.bodyText}>Vers\u00e3o: {Platform.Version?.toString() || "-"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          <Text style={styles.bullet}>\u2022 Como virar Premium? Toque no bot\u00e3o "Upgrade" no topo da tela e realize o pagamento \u00fanico via Google Play.</Text>
          <Text style={styles.bullet}>\u2022 O Premium \u00e9 assinatura? N\u00e3o, \u00e9 pagamento \u00fanico. Pague uma vez e use para sempre.</Text>
          <Text style={styles.bullet}>\u2022 Posso gravar sons? Sim, o gravador est\u00e1 dispon\u00edvel na aba "Meus Sons" ap\u00f3s virar Premium.</Text>
          <Text style={styles.bullet}>\u2022 O timer funciona com o app fechado? O timer persiste e toca quando voc\u00ea reabre o app, mas a grava\u00e7\u00e3o do hor\u00e1rio \u00e9 feita localmente.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reportar Bug</Text>
          <Text style={styles.bodyText}>
            Se encontrou algum bug, envie um email para rafaelsouzadasilva1982@gmail.com com:
          </Text>
          <Text style={styles.bullet}>\u2022 Descri\u00e7\u00e3o do problema</Text>
          <Text style={styles.bullet}>\u2022 Passos para reproduzir</Text>
          <Text style={styles.bullet}>\u2022 Vers\u00e3o do app e do sistema operacional</Text>
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
    gap: 18,
  },
  title: {
    color: neon.cyan,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  subtitle: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    color: neon.purple,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    marginTop: 4,
  },
  bodyText: {
    color: neon.text,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  hint: {
    color: neon.textFaint,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  bullet: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 4,
  },
});
