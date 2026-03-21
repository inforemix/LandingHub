import { isAdminAuthorized, unauthorizedJson } from "@/lib/admin-auth";

export async function GET(request) {
  if (!isAdminAuthorized(request)) return unauthorizedJson();
  return Response.json({ ok: true });
}
