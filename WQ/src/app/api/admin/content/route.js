import { isAdminAuthorized, unauthorizedJson } from "@/lib/admin-auth";
import { readLandingContent, writeLandingContent } from "@/lib/content-store";

export async function GET(request) {
  if (!isAdminAuthorized(request)) return unauthorizedJson();
  try {
    const content = await readLandingContent();
    return Response.json({ ok: true, content });
  } catch (error) {
    console.error("[api/admin/content] Failed to read content, returning defaults.", error);
    return Response.json({ ok: true, content: {}, fallback: true });
  }
}

export async function PUT(request) {
  if (!isAdminAuthorized(request)) return unauthorizedJson();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !body.content || typeof body.content !== "object") {
    return Response.json({ ok: false, message: "Missing content object." }, { status: 400 });
  }

  try {
    const saved = await writeLandingContent(body.content);
    const warnings = saved.warnings || [];
    return Response.json({
      ok: true,
      content: saved.content,
      warnings,
      message: warnings.length ? "Saved with some fields auto-corrected." : "Content saved.",
    });
  } catch (error) {
    console.error("[api/admin/content] Failed to save content.", error);
    return Response.json({ ok: false, message: "Failed to save content file." }, { status: 500 });
  }
}
