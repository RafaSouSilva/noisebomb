# Como gerar o APK do NoiseBomb

## Comando para build (rode no terminal do Replit)

```bash
cd artifacts/mobile
EXPO_TOKEN=DCBCLENKDSKfLi8A5EIq3XmLVhmIqZ-6R3op2gfZ npx eas-cli@latest build --platform android --profile preview --non-interactive
```

## O que vai acontecer

1. O EAS vai compactar o projeto e enviar para os servidores do Expo
2. O build leva ~10-15 minutos
3. Você receberá um email ou pode acompanhar em: https://expo.dev/accounts/rafasousilva/projects/noisebomb/builds
4. Quando terminar, baixe o APK diretamente do link

## Perfil de build (eas.json)

- **preview** = APK (para testar no celular)
- **production** = AAB (para enviar à Play Store)

## Para gerar AAB (Play Store)

```bash
cd artifacts/mobile
EXPO_TOKEN=DCBCLENKDSKfLi8A5EIq3XmLVhmIqZ-6R3op2gfZ npx eas-cli@latest build --platform android --profile production --non-interactive
```

## Dica

Se quiser testar o QR code primeiro (sem instalar APK):
1. Baixe o app **Expo Go** na Play Store
2. Escaneie o QR code que geramos anteriormente
3. O app funciona no Expo Go (mas IAP só funciona no APK instalado)
