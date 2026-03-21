import { isAdminAuthorized, unauthorizedJson } from "@/lib/admin-auth";
import { listSubscribers } from "@/lib/subscribers-store";

function escapeCsv(value) {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows) {
  const headers = ["id", "email", "status", "source", "consent", "createdAt", "confirmedAt"];
  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(headers.map((key) => escapeCsv(row[key])).join(","));
  }

  return `${lines.join("\n")}\n`;
}

export async function GET(request) {
  if (!isAdminAuthorized(request)) return unauthorizedJson();

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const subscribers = await listSubscribers();

    if (format === "csv") {
      const csv = toCsv(subscribers);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return Response.json({ ok: true, count: subscribers.length, subscribers });
  } catch (error) {
    console.error("[api/admin/subscribers] Failed to load subscribers.", error);
    return Response.json({ ok: false, message: "Failed to load subscribers." }, { status: 500 });
  }
}
