import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const APP_ROOT = existsSync(path.join(process.cwd(), "src", "app"))
  ? process.cwd()
  : path.join(process.cwd(), "WQ");
const DATA_PATH = path.join(APP_ROOT, "data", "subscribers.json");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001";

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

function tokenExpiryISO(hours = 24) {
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000);
  return expires.toISOString();
}

async function ensureDataFile() {
  const dir = path.dirname(DATA_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]", "utf8");
  }
}

async function readLocalSubscribers() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw || "[]");
}

async function writeLocalSubscribers(subscribers) {
  await fs.writeFile(DATA_PATH, JSON.stringify(subscribers, null, 2), "utf8");
}

function supabaseHeaders(prefer = "return=representation") {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: prefer,
  };
}

async function supabaseFetch(pathname, init = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error (${response.status}): ${text}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function createOrGetPendingSubscriber(email) {
  if (isSupabaseConfigured()) {
    try {
      const existing = await supabaseFetch(`subscribers?email=eq.${encodeURIComponent(email)}&select=id,email,status` , {
        method: "GET",
        headers: supabaseHeaders(),
      });

      if (existing?.length) {
        return { subscriber: existing[0], exists: true };
      }

      const inserted = await supabaseFetch("subscribers", {
        method: "POST",
        headers: supabaseHeaders(),
        body: JSON.stringify([{ email, status: "pending", consent: true, source: "landing_page" }]),
      });

      return { subscriber: inserted[0], exists: false };
    } catch (error) {
      console.error("[subscribers] Supabase create/read failed. Falling back to local store.", error);
    }
  }

  const list = await readLocalSubscribers();
  const existing = list.find((item) => item.email === email);

  if (existing) return { subscriber: existing, exists: true };

  const subscriber = {
    id: crypto.randomUUID(),
    email,
    status: "pending",
    consent: true,
    source: "landing_page",
    createdAt: new Date().toISOString(),
    confirmations: [],
  };

  list.push(subscriber);
  await writeLocalSubscribers(list);

  return { subscriber, exists: false };
}

async function saveConfirmationToken(subscriberId, token, expiresAt) {
  if (isSupabaseConfigured()) {
    try {
      await supabaseFetch("email_confirmations", {
        method: "POST",
        headers: supabaseHeaders("return=minimal"),
        body: JSON.stringify([{ subscriber_id: subscriberId, token, expires_at: expiresAt }]),
      });
      return;
    } catch (error) {
      console.error("[subscribers] Supabase token save failed. Falling back to local store.", error);
    }
  }

  const list = await readLocalSubscribers();
  const target = list.find((item) => item.id === subscriberId);
  if (!target) return;

  target.confirmations = target.confirmations || [];
  target.confirmations.push({
    token,
    expiresAt,
    consumedAt: null,
    createdAt: new Date().toISOString(),
  });

  await writeLocalSubscribers(list);
}

async function consumeConfirmationToken(token) {
  if (isSupabaseConfigured()) {
    try {
      const records = await supabaseFetch(`email_confirmations?token=eq.${token}&consumed_at=is.null&select=id,subscriber_id,expires_at`, {
        method: "GET",
        headers: supabaseHeaders(),
      });

      if (!records?.length) return { ok: false, message: "Invalid confirmation token." };

      const record = records[0];
      if (new Date(record.expires_at).getTime() < Date.now()) {
        return { ok: false, message: "This confirmation link has expired." };
      }

      await supabaseFetch(`email_confirmations?id=eq.${record.id}`, {
        method: "PATCH",
        headers: supabaseHeaders("return=minimal"),
        body: JSON.stringify({ consumed_at: new Date().toISOString() }),
      });

      await supabaseFetch(`subscribers?id=eq.${record.subscriber_id}`, {
        method: "PATCH",
        headers: supabaseHeaders("return=minimal"),
        body: JSON.stringify({ status: "confirmed", confirmed_at: new Date().toISOString() }),
      });

      return { ok: true, message: "Your email is confirmed." };
    } catch (error) {
      console.error("[subscribers] Supabase confirm failed. Falling back to local store.", error);
    }
  }

  const list = await readLocalSubscribers();
  let matched = null;

  for (const item of list) {
    const confirmations = item.confirmations || [];
    const found = confirmations.find((entry) => entry.token === token && !entry.consumedAt);
    if (found) {
      matched = { subscriber: item, entry: found };
      break;
    }
  }

  if (!matched) return { ok: false, message: "Invalid confirmation token." };

  if (new Date(matched.entry.expiresAt).getTime() < Date.now()) {
    return { ok: false, message: "This confirmation link has expired." };
  }

  matched.entry.consumedAt = new Date().toISOString();
  matched.subscriber.status = "confirmed";
  matched.subscriber.confirmedAt = new Date().toISOString();

  await writeLocalSubscribers(list);

  return { ok: true, message: "Your email is confirmed." };
}

async function listSubscribers() {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseFetch(
        "subscribers?select=id,email,status,source,consent,created_at,confirmed_at&order=created_at.desc",
        {
          method: "GET",
          headers: supabaseHeaders(),
        },
      );

      return (rows || []).map((row) => ({
        id: row.id,
        email: row.email,
        status: row.status || "pending",
        source: row.source || "landing_page",
        consent: Boolean(row.consent),
        createdAt: row.created_at || null,
        confirmedAt: row.confirmed_at || null,
      }));
    } catch (error) {
      console.error("[subscribers] Supabase list failed. Falling back to local store.", error);
    }
  }

  const rows = await readLocalSubscribers();
  return rows
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .map((row) => ({
      id: row.id,
      email: row.email,
      status: row.status || "pending",
      source: row.source || "landing_page",
      consent: Boolean(row.consent),
      createdAt: row.createdAt || null,
      confirmedAt: row.confirmedAt || null,
    }));
}

export {
  createOrGetPendingSubscriber,
  saveConfirmationToken,
  consumeConfirmationToken,
  listSubscribers,
  createToken,
  tokenExpiryISO,
  isValidEmail,
  NEXT_PUBLIC_SITE_URL,
  isSupabaseConfigured,
};
