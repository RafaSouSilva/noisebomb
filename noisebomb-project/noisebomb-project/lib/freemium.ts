import AsyncStorage from "@react-native-async-storage/async-storage";

const LOOP_KEY = "@noisebomb/loopDate";
const TIMER_KEY = "@noisebomb/timerDate";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export async function canUseLoopToday(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(LOOP_KEY);
  return stored !== todayStr();
}

export async function canUseTimerToday(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(TIMER_KEY);
  return stored !== todayStr();
}

export async function recordLoopUsage(): Promise<void> {
  await AsyncStorage.setItem(LOOP_KEY, todayStr());
}

export async function recordTimerUsage(): Promise<void> {
  await AsyncStorage.setItem(TIMER_KEY, todayStr());
}
