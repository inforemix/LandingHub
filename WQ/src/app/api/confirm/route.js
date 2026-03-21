import { consumeConfirmationToken } from "@/lib/subscribers-store";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";

  if (!token) {
    return new Response("Missing token.", { status: 400 });
  }

  const result = await consumeConfirmationToken(token);

  if (!result.ok) {
    return new Response(`<html><body style=\"font-family:Arial,sans-serif;padding:24px\"><h1>Email confirmation</h1><p>${result.message}</p></body></html>`, {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new Response(`<html><body style=\"font-family:Arial,sans-serif;padding:24px\"><h1>Email confirmed</h1><p>${result.message}</p><a href=\"/\">Go back to landing page</a></body></html>`, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
