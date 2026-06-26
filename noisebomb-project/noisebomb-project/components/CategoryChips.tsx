import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { CATEGORIES, CategoryId } from "@/constants/sounds";
import { neon } from "@/constants/colors";

interface Props {
  selected: CategoryId;
  onSelect: (id: CategoryId) => void;
}

export function CategoryChips({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CATEGORIES.map((cat) => {
        const active = cat.id === selected;
        return (
          <Pressable
            key={cat.id}
            testID={`chip-${cat.id}`}
            onPress={() => {
              if (Platform.OS !== "web") {
                void Haptics.selectionAsync();
              }
              onSelect(cat.id);
            }}
            style={[
              styles.chip,
              {
                borderColor: active ? cat.color : neon.cardBorder,
                backgroundColor: active ? cat.color + "22" : neon.surface,
                shadowColor: cat.color,
                shadowOpacity: active ? 0.8 : 0,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={cat.icon as never}
              size={16}
              color={active ? cat.color : neon.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: active ? cat.color : neon.textMuted },
              ]}
            >
              {cat.label}
            </Text>
            {cat.premium ? (
              <MaterialCommunityIcons
                name="crown"
                size={13}
                color={active ? neon.gold : neon.textFaint}
              />
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
