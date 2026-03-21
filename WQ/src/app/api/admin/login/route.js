import { isValidAdminPassword, getSetAdminCookieValue } from "@/lib/admin-auth";

export async function POST(request) {
  let body = null;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const password = typeof body?.password === "string" ? body.password : "";
  if (!isValidAdminPassword(password)) {
    return Response.json({ ok: false, message: "Invalid password." }, { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": getSetAdminCookieValue(),
    },
  });
}
