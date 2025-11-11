import WebpushSubscription from "../../models/WebpushSubscription";

interface SubscriptionData {
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

const CreateWebpushSubscriptionService = async ({
  userId,
  endpoint,
  p256dh,
  auth
}: SubscriptionData): Promise<WebpushSubscription> => {
  const [subscription] = await WebpushSubscription.findOrCreate({
    where: { userId, endpoint },
    defaults: { userId, endpoint, p256dh, auth }
  });

  return subscription;
};

export default CreateWebpushSubscriptionService;
