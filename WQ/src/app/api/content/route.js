import { readLandingContent } from "@/lib/content-store";

export async function GET() {
  try {
    const content = await readLandingContent();
    return Response.json({ ok: true, content });
  } catch (error) {
    console.error("[api/content] Failed to read CMS content, returning defaults.", error);
    return Response.json({ ok: true, content: {}, fallback: true });
  }
}
