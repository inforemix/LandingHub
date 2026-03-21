import {
  createOrGetPendingSubscriber,
  saveConfirmationToken,
  createToken,
  tokenExpiryISO,
  isValidEmail,
  NEXT_PUBLIC_SITE_URL,
} from "@/lib/subscribers-store";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body?.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return Response.json({ ok: false, message: "Please enter a valid email." }, { status: 400 });
    }

    const { subscriber, exists } = await createOrGetPendingSubscriber(email);

    if (subscriber?.status === "confirmed") {
      return Response.json({ ok: true, message: "You are already confirmed." });
    }

    const token = createToken();
    const expiresAt = tokenExpiryISO(24);
    await saveConfirmationToken(subscriber.id, token, expiresAt);

    const confirmUrl = `${NEXT_PUBLIC_SITE_URL}/api/confirm?token=${token}`;

    if (exists) {
      return Response.json({
        ok: true,
        message: "Confirmation link regenerated.",
        confirmUrl,
      });
    }

    return Response.json({
      ok: true,
      message: "Thanks! Please confirm your email.",
      confirmUrl,
    });
  } catch (error) {
    console.error("[signup] Request failed", error);
    return Response.json({ ok: false, message: "Signup failed. Please try again." }, { status: 500 });
  }
}
