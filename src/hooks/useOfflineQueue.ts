import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { BottleInsertPayload } from "../types/bottle";

const STORAGE_KEY = "vin-journal::pending-bottles";

export async function enqueueBottle(payload: BottleInsertPayload) {
  const current = await AsyncStorage.getItem(STORAGE_KEY);
  const list: BottleInsertPayload[] = current ? JSON.parse(current) : [];
  list.push(payload);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function flushBottleQueue() {
  const serialized = await AsyncStorage.getItem(STORAGE_KEY);
  if (!serialized) return;

  const items: BottleInsertPayload[] = JSON.parse(serialized);
  if (!items.length) return;

  const { error } = await supabase.from("bottles").insert(items);
  if (!error) {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

export function useOfflineQueue(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    flushBottleQueue();
  }, [enabled]);
}
