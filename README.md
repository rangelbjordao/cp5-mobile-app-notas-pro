# 📝 App de Notas com Autenticação

Aplicação mobile desenvolvida com React Native para criação e gerenciamento de notas pessoais, com autenticação de usuários via Firebase e armazenamento via Firestore.

## Integrantes

- Rangel Bernardi Jordão - RM560547
- Jhonatta Lima Sandes de Oliveira - RM560277
- Lucas José Lima - RM561160

## Descrição

O app permite que usuários se cadastrem, façam login e gerenciem suas próprias notas. Cada usuário só tem acesso às suas próprias notas.

## Funcionalidades

- Cadastro e login de usuários
- Criar, visualizar, editar e deletar notas
- Notas salvas por usuário no Firestore
- Confirmação antes de deletar uma nota
- Persistência de sessão com AsyncStorage
- Internacionalização com suporte a Português e Inglês
- Seletor interno para troca de idioma
- Captura automática de latitude e longitude ao criar uma nota
- Armazenamento das coordenadas da nota no Firestore
- Exibição de mapa com marcador indicando o local onde a nota foi criada
- Conversão das coordenadas em endereço aproximado usando geocoding reverso
- Integração com Expo Notifications
- Agendamento de lembrete para uma nota em data e hora específicas

## Tecnologias Utilizadas

- React Native
- Expo
- TypeScript
- Firebase Authentication
- Firestore
- Expo Router
- AsyncStorage
- i18next
- Expo Localization
- Expo Location
- React Native Maps
- Expo Notifications
- React Native DateTimePicker
- EAS Build

## Como Rodar o Projeto

### Pré-requisitos

- Node.js
- Expo CLI

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/rangelbjordao/cp5-mobile-app-notas-pro.git
```

2. Instale as dependências:

```bash
npm install
```

3. Rode o projeto:

```bash
npx expo start
```

## Build Android

### Google Maps API Key

Para gerar um novo APK com o mapa funcionando, é necessário configurar uma chave do Google Maps no `app.json`, no campo `android.config.googleMaps.apiKey`.

A chave precisa ter o **Maps SDK for Android** ativado no Google Cloud.

O projeto está configurado para geração de build Android pelo EAS Build.

Para gerar o APK, utilize:

```bash
npx eas build --platform android --profile preview
```

## APK

O APK gerado para instalação em dispositivos Android está disponível no link abaixo:

Link para instalação:

[Baixar APK pelo Expo](https://expo.dev/accounts/rangelbjordao13/projects/cp5-mobile-app-notas/builds/0a2313fd-0f7e-4478-be17-ebd21ce0ef52)

Link alternativo pelo Google Drive:

[Baixar APK pelo Google Drive](https://drive.google.com/file/d/1rkeG_VsYY6Z8_L5I-OATlrCB8rkvhxPx/view?usp=sharing)

## Vídeo de Demonstração

[Clique aqui para assistir](https://youtu.be/XZR4jIx3p0c)
