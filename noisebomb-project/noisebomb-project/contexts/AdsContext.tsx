import React, { createContext, useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { neon } from "@/constants/colors";

/** =========================================================================
 *  Google AdMob / Google Ads  — STUBS
 *  =========================================================================
 *  Substituir pelos imports reais do react-native-google-mobile-ads quando
 *  o SDK do Google Ads estiver configurado:
 *
 *    import {
 *      BannerAd,
 *      BannerAdSize,
 *      InterstitialAd,
 *      AdEventType,
 *      TestIds,
 *    } from "react-native-google-mobile-ads";
 *
 *  O bannerId e interstitialId abaixo são apenas placeholders.
 *  No modo produção, usar os IDs fornecidos pelo Google AdMob Console.
 *  ========================================================================= */

const BANNER_ID = "ca-app-pub-9339278040381979/7346669790";
const INTERSTITIAL_ID = "ca-app-pub-9339278040381979/1226581635";

interface AdsContextValue {
  /** Banner componente (placeholder). Substitua por <BannerAd /> real. */
  Banner: React.FC<{ onPress?: () => void }>;
  /** Mostrar anúncio interstitial (vídeo). Retorna true quando o usuário assiste. */
  showInterstitial: () => Promise<boolean>;
  /** True se o usuário já viu o interstitial de abertura nesta sessão. */
  introShown: boolean;
  /** Nome do evento ad (placeholder para analytics). */
  trackAdEvent: (event: string) => void;
}

const AdsCtx = createContext<AdsContextValue | undefined>(undefined);

function FakeBanner({ onPress }: { onPress?: () => void }) {
  return (
    <View
      style={{
        backgroundColor: neon.surface,
        borderWidth: 1,
        borderColor: neon.cardBorder,
        borderStyle: "dashed",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
        height: 60,
      }}
    >
      <Text style={{ color: neon.textFaint, fontSize: 12 }}>
        [Google Banner Ad — coloque o BannerAd aqui]
      </Text>
    </View>
  );
}

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [introShown, setIntroShown] = useState(false);

  useEffect(() => {
    // TODO: carregar o interstitial real na inicialização
    // const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);
    // interstitial.load();
    // ...
  }, []);

  async function showInterstitial(): Promise<boolean> {
    // TODO: substituir por show() real do InterstitialAd
    // interstitial.show();
    // await waitForClose();
    setIntroShown(true);
    return true;
  }

  function trackAdEvent(event: string) {
    // TODO: enviar para analytics (Google Analytics, Firebase, etc.)
    console.log("[Ad Event]", event);
  }

  return (
    <AdsCtx.Provider
      value={{
        Banner: FakeBanner,
        showInterstitial,
        introShown,
        trackAdEvent,
      }}
    >
      {children}
    </AdsCtx.Provider>
  );
}

export function useAds(): AdsContextValue {
  const ctx = useContext(AdsCtx);
  if (!ctx) throw new Error("useAds must be used within AdsProvider");
  return ctx;
}
