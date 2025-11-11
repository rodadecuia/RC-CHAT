import webpush from "web-push";
import WebpushSubscription from "../../models/WebpushSubscription";

interface Request {
  subscription: WebpushSubscription;
  payload: string;
}

const SendWebpushNotificationService = async ({
  subscription,
  payload
}: Request): Promise<void> => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    throw new Error("VAPID keys are not configured.");
  }

  webpush.setVapidDetails(
    "mailto:example@example.com", // Você pode querer tornar isso configurável
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      },
      payload
    );
  } catch (err) {
    // Se a inscrição for inválida (ex: o usuário revogou a permissão),
    // podemos removê-la do banco de dados.
    if (err.statusCode === 410 || err.statusCode === 404) {
      await subscription.destroy();
    }
    console.error("Error sending web push notification:", err);
  }
};

export default SendWebpushNotificationService;
