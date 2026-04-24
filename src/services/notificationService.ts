import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import i18n from "./i18n";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const solicitarPermissaoNotificacao = async () => {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === "granted") {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    Alert.alert(
      i18n.t("notif_permission_title"),
      i18n.t("notif_permission_message"),
      [
        {
          text: i18n.t("deny"),
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: i18n.t("allow"),
          onPress: async () => {
            const { status: novoStatus } =
              await Notifications.requestPermissionsAsync();

            resolve(novoStatus === "granted");
          },
        },
      ],
    );
  });
};

export const enviarNotificacaoLocal = async (titulo: string, corpo: string) => {
  try {
    const permitido = await solicitarPermissaoNotificacao();

    if (!permitido) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: corpo,
      },
      trigger: null,
    });
  } catch (error) {
    console.log("Erro ao disparar notificação local:", error);
  }
};
