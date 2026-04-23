import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const enviarNotificacaoLocal = async (titulo: string, corpo: string) => {
  try {
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
