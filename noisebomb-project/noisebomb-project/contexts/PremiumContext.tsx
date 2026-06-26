import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { Platform } from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "@noisebomb/isPremium";

/** SKU of the one-time premium product in Google Play Console. */
export const PREMIUM_SKU = "noisebomb_premium";

interface PriceInfo {
  amount: string;
  currency: string;
  isBrazil: boolean;
}

interface PremiumContextValue {
  isPremium: boolean;
  loading: boolean;
  price: PriceInfo;
  goPremium: () => Promise<void>;
  resetPremium: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

function detectPrice(): PriceInfo {
  let isBrazil = false;
  try {
    const locales = Localization.getLocales();
    isBrazil = locales.some(
      (l) =>
        l.regionCode === "BR" ||
        (l.languageTag ?? "").toLowerCase().startsWith("pt-br"),
    );
  } catch {
    isBrazil = false;
  }
  return isBrazil
    ? { amount: "R$ 20,00", currency: "BRL", isBrazil: true }
    : { amount: "U$ 10.00", currency: "USD", isBrazil: false };
}

// Lazy-load IAP module to avoid bundling errors on web
let iapModule: any = null;
async function getIapModule() {
  if (Platform.OS === "web") return null;
  if (!iapModule) {
    try {
      iapModule = require("react-native-iap");
    } catch {
      return null;
    }
  }
  return iapModule;
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [price] = useState<PriceInfo>(() => detectPrice());
  const purchaseUpdateRef = useRef<any>(null);
  const purchaseErrorRef = useRef<any>(null);

  // Initialize IAP connection, load products, and restore purchases
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Check local cache first
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "true") setIsPremium(true);

        // Skip IAP on web
        if (Platform.OS === "web") {
          setLoading(false);
          return;
        }

        const iap = await getIapModule();
        if (!iap) {
          setLoading(false);
          return;
        }

        // Initialize IAP connection
        await iap.initConnection();
        if (iap.flushFailedPurchasesCachedAsPendingAndroid) {
          await iap.flushFailedPurchasesCachedAsPendingAndroid();
        }

        // Get product info
        try {
          const products = await iap.getProducts({ skus: [PREMIUM_SKU] });
          if (mounted && products && products.length > 0) {
            // Product info available but not needed for UI
          }
        } catch {
          // Product may not be configured in Google Play Console yet
        }

        // Restore previous purchases
        try {
          const purchases = await iap.getAvailablePurchases();
          const hasPremium = purchases.some(
            (p: any) => p.productId === PREMIUM_SKU,
          );
          if (hasPremium) {
            setIsPremium(true);
            await AsyncStorage.setItem(STORAGE_KEY, "true");
          }
        } catch {
          // ignore
        }

        // Listen for purchase updates
        purchaseUpdateRef.current = iap.purchaseUpdatedListener(async (purchase: any) => {
          if (purchase.productId === PREMIUM_SKU) {
            const receipt = purchase.transactionReceipt || purchase.purchaseToken;
            if (receipt) {
              await iap.finishTransaction({ purchase, isConsumable: false });
              setIsPremium(true);
              await AsyncStorage.setItem(STORAGE_KEY, "true");
            }
          }
        });

        purchaseErrorRef.current = iap.purchaseErrorListener((error: any) => {
          console.warn("Purchase error", error);
        });
      } catch (e) {
        console.warn("IAP init error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      purchaseUpdateRef.current?.remove?.();
      purchaseErrorRef.current?.remove?.();
      if (Platform.OS !== "web") {
        getIapModule().then((m) => m?.endConnection?.());
      }
    };
  }, []);

  const refreshStatus = useCallback(async () => {
    if (Platform.OS === "web") {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setIsPremium(stored === "true");
      return;
    }
    try {
      const iap = await getIapModule();
      if (!iap) return;
      const purchases = await iap.getAvailablePurchases();
      const hasPremium = purchases.some((p: any) => p.productId === PREMIUM_SKU);
      setIsPremium(hasPremium);
      await AsyncStorage.setItem(STORAGE_KEY, hasPremium ? "true" : "false");
    } catch {
      // ignore
    }
  }, []);

  const goPremium = useCallback(async () => {
    if (Platform.OS === "web") {
      // Fallback: activate locally on web (for testing)
      setIsPremium(true);
      await AsyncStorage.setItem(STORAGE_KEY, "true");
      return;
    }
    const iap = await getIapModule();
    if (!iap) {
      throw new Error("IAP n\u00e3o dispon\u00edvel");
    }
    try {
      await iap.requestPurchase({ sku: PREMIUM_SKU });
    } catch (e: any) {
      console.warn("Purchase request failed", e);
      throw e;
    }
  }, []);

  const resetPremium = useCallback(async () => {
    setIsPremium(false);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <PremiumContext.Provider
      value={{ isPremium, loading, price, goPremium, resetPremium, refreshStatus }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
}
