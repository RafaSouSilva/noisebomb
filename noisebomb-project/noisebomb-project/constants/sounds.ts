import type { ImageSourcePropType } from "react-native";

import { neon } from "./colors";

export type CategoryId =
  | "animais"
  | "cartoon"
  | "construcao"
  | "outros"
  | "meus";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string; // MaterialCommunityIcons name
  color: string;
  premium?: boolean;
}

export interface SoundItem {
  id: string;
  name: string;
  category: CategoryId;
  icon: string; // MaterialCommunityIcons name (fallback)
  color: string;
  /** Local audio asset via require() — works offline. */
  source: number;
  /** Local image asset via require() — works offline. */
  image?: ImageSourcePropType;
}

export const CATEGORIES: Category[] = [
  { id: "animais", label: "Animais", icon: "paw", color: neon.cyan },
  { id: "cartoon", label: "Cartoon", icon: "emoticon-tongue", color: neon.purple },
  { id: "construcao", label: "Constru\u00e7\u00e3o", icon: "hammer-wrench", color: neon.lime },
  { id: "outros", label: "Outros", icon: "bullhorn", color: neon.pink },
  { id: "meus", label: "Meus Sons", icon: "microphone", color: neon.gold, premium: true },
];

// Local bundled audio and images — works 100% offline.
export const SOUNDS: SoundItem[] = [
  // Animais
  { id: "mosquito", name: "Mosquito", category: "animais", icon: "bee", color: neon.cyan, source: require("../assets/sounds/mosquito.mp3"), image: require("../assets/images/animais/mosquito.png") },
  { id: "vaca", name: "Vaca", category: "animais", icon: "cow", color: neon.cyan, source: require("../assets/sounds/vaca.mp3"), image: require("../assets/images/animais/vaca.png") },
  { id: "galinha", name: "Galinha", category: "animais", icon: "egg", color: neon.cyan, source: require("../assets/sounds/galinha.mp3"), image: require("../assets/images/animais/galinha.png") },
  { id: "cachorro", name: "Cachorro", category: "animais", icon: "dog", color: neon.cyan, source: require("../assets/sounds/cachorro.mp3"), image: require("../assets/images/animais/cachorro.png") },
  { id: "gato", name: "Gato", category: "animais", icon: "cat", color: neon.cyan, source: require("../assets/sounds/gato.mp3"), image: require("../assets/images/animais/gato.png") },

  // Cartoon
  { id: "boing", name: "Boing", category: "cartoon", icon: "arrow-up-bold", color: neon.purple, source: require("../assets/sounds/boing.mp3") },
  { id: "vineboom", name: "Vine Boom", category: "cartoon", icon: "flash", color: neon.purple, source: require("../assets/sounds/vineboom.mp3") },
  { id: "risada", name: "Risada", category: "cartoon", icon: "emoticon-excited", color: neon.purple, source: require("../assets/sounds/risada.mp3") },
  { id: "bruh", name: "Bruh", category: "cartoon", icon: "emoticon-neutral", color: neon.purple, source: require("../assets/sounds/bruh.mp3") },
  { id: "erro", name: "Erro", category: "cartoon", icon: "alert-circle", color: neon.purple, source: require("../assets/sounds/erro.mp3") },

  // Constru\u00e7\u00e3o
  { id: "furadeira", name: "Furadeira", category: "construcao", icon: "screwdriver", color: neon.lime, source: require("../assets/sounds/furadeira.mp3") },
  { id: "martelo", name: "Martelo", category: "construcao", icon: "hammer", color: neon.lime, source: require("../assets/sounds/martelo.mp3") },
  { id: "serra", name: "Serra El\u00e9trica", category: "construcao", icon: "saw-blade", color: neon.lime, source: require("../assets/sounds/serra.mp3") },

  // Outros
  { id: "carro", name: "Batida de Carro", category: "outros", icon: "car-emergency", color: neon.pink, source: require("../assets/sounds/carro.mp3") },
  { id: "peido", name: "Peido", category: "outros", icon: "weather-windy", color: neon.pink, source: require("../assets/sounds/peido.mp3") },
  { id: "buzina", name: "Buzina", category: "outros", icon: "bugle", color: neon.pink, source: require("../assets/sounds/buzina.mp3") },
  { id: "alarme", name: "Alarme de Inc\u00eandio", category: "outros", icon: "fire-alert", color: neon.pink, source: require("../assets/sounds/alarme.mp3") },
];

export interface TimerOption {
  label: string;
  seconds: number;
}

export const TIMER_OPTIONS: TimerOption[] = [
  { label: "Instant\u00e2neo", seconds: 0 },
  { label: "10s", seconds: 10 },
  { label: "30s", seconds: 30 },
  { label: "1min", seconds: 60 },
  { label: "2min", seconds: 120 },
  { label: "5min", seconds: 300 },
];
