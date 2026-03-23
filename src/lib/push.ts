import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase/admin";

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return;
  webpush.setVapidDetails("mailto:contacto@mipropina.es", publicKey, privateKey);
  vapidConfigured = true;
}

export async function sendPushToRestaurant(
  restaurantId: string,
  payload: { title: string; body: string; url?: string; tag?: string }
) {
  ensureVapid();
  if (!vapidConfigured) return;

  const { data: subscriptions } = await supabaseAdmin
    .from("push_subscription")
    .select("endpoint, p256dh, auth")
    .eq("restaurant_id", restaurantId);

  if (!subscriptions?.length) return;

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload)
      )
    )
  );

  // Clean up expired subscriptions (410 Gone)
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected" && result.reason?.statusCode === 410) {
      await supabaseAdmin
        .from("push_subscription")
        .delete()
        .eq("endpoint", subscriptions[i].endpoint);
    }
  }
}
