# NoiseBomb - Projeto para Build

## Como gerar o AAB para Play Store

### Opcao 1: EAS Build (na nuvem, gratis)
1. Instale o EAS CLI: `npm install -g eas-cli`
2. Faca login: `eas login` (ou use o token)
3. Rode: `eas build --platform android --profile production`
4. Aguarde o email com o link

### Opcao 2: Build Local (requer Android Studio)
1. Instale dependencias: `npm install`
2. Rode: `npx expo prebuild --platform android`
3. Abra a pasta `android` no Android Studio
4. Gere o APK/AAB via Build > Generate Signed Bundle

## Token EAS
EXPO_TOKEN=DCBCLENKDSKfLi8A5EIq3XmLVhmIqZ-6R3op2gfZ

## Projeto Expo
- Conta: rafasousilva
- Projeto: noisebomb
- ID: 5288b0b9-d519-49c8-9c3a-55824f41475d
