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

export const solicitarPermissaoNotificacao = async () => {
  const { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    const { status: novoStatus } =
      await Notifications.requestPermissionsAsync();

    if (novoStatus !== "granted") {
      console.log("Permissão de notificação negada");
      return false;
    }
  }

  return true;
};
