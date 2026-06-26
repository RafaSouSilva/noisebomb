import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { neon } from "@/constants/colors";

interface Props {
  onUpgrade: () => void;
}

export function AdBanner({ onUpgrade }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View style={styles.wrap}>
      {/* Banner Google AdMob — TODO: substituir pelo <BannerAd /> real */}
      <View style={styles.banner}>
        <Animated.View style={[styles.adTag, { opacity }]}>
          <Text style={styles.adTagText}>AD</Text>
        </Animated.View>
        <View style={styles.adBody}>
          <Text style={styles.adTitle}>Anúncio Patrocinado</Text>
          <Text style={styles.adSub}>Cansado de anúncios? Fique Premium.</Text>
        </View>
        <Pressable
          testID="ad-upgrade"
          onPress={onUpgrade}
          style={styles.removeBtn}
        >
          <MaterialCommunityIcons name="close-circle" size={14} color={neon.gold} />
          <Text style={styles.removeText}>Remover</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: neon.surface,
    borderWidth: 1,
    borderColor: neon.cardBorder,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  adTag: {
    backgroundColor: neon.textFaint,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  adTagText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1,
  },
  adBody: {
    flex: 1,
  },
  adTitle: {
    color: neon.text,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  adSub: {
    color: neon.textMuted,
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 1,
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: neon.gold + "66",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removeText: {
    color: neon.gold,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
