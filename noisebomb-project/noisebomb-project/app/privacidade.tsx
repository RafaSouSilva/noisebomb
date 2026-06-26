import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { neon } from "@/constants/colors";

export default function PrivacidadeScreen() {
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
        <Text style={styles.headerTitle}>Privacidade</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}>
        <Text style={styles.title}>Política de Privacidade</Text>
        <Text style={styles.date}>Última atualização: 26 de junho de 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Dados que coletamos</Text>
          <Text style={styles.bodyText}>
            O NoiseBomb coleta apenas o mínimo necessário para funcionar:
          </Text>
          <Text style={styles.bullet}>• Identificador do dispositivo — para rastrear o status Premium e contar uso de recursos gratuitos.</Text>
          <Text style={styles.bullet}>• Gravações locais — sons gravados ficam no próprio aparelho, nunca são enviados para nossos servidores.</Text>
          <Text style={styles.bullet}>• Dados de pagamento — processados pelo Google Play In-App Purchase. Não armazenamos números de cartão.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Como usamos os dados</Text>
          <Text style={styles.bodyText}>
            Usamos os dados para:
          </Text>
          <Text style={styles.bullet}>• Desbloquear o Premium no dispositivo após a compra.</Text>
          <Text style={styles.bullet}>• Respeitar o limite diário de loop/timer para usuários gratuitos.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Compartilhamento</Text>
          <Text style={styles.bodyText}>
            Não vendemos dados. Compartilhamos apenas com o Google Play para processamento de pagamentos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Permissões</Text>
          <Text style={styles.bodyText}>
            <MaterialCommunityIcons name="microphone" size={14} color={neon.textMuted} /> Microfone: usado exclusivamente para gravar sons.
          </Text>
          <Text style={styles.bodyText}>
            <MaterialCommunityIcons name="volume-high" size={14} color={neon.textMuted} /> Áudio: usado para tocar sons e manter playback em background.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Contato</Text>
          <Text style={styles.bodyText}>
            Dúvidas? Entre em contato: rafaelsouzadasilva1982@gmail.com
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
    gap: 18,
  },
  title: {
    color: neon.purple,
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  date: {
    color: neon.textFaint,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    color: neon.cyan,
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    marginTop: 4,
  },
  bodyText: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  bullet: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 4,
  },
});
