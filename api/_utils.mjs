import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_SECRET = process.env.APP_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
if (!APP_SECRET) {
  console.warn("Missing APP_SECRET");
}

export const supabaseAdmin = createClient(SUPABASE_URL ?? "", SUPABASE_SERVICE_ROLE_KEY ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

export function json(res, status, data, headers = {}) {
  return res.status(status).json(data);
}

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
}

function hmac(data) {
  return b64url(crypto.createHmac("sha256", APP_SECRET ?? "dev").update(data).digest());
}

export function signSession(payload) {
  const body = b64url(JSON.stringify(payload));
  const sig = hmac(body);
  return `${body}.${sig}`;
}

export function verifySession(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = hmac(body);
  if (sig !== expected) return null;
  try {
    const jsonStr = Buffer.from(body.replace(/-/g,"+").replace(/_/g,"/"), "base64").toString("utf8");
    const payload = JSON.parse(jsonStr);
    if (payload?.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach(part => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("=") || "");
  });
  return out;
}

export function setCookie(res, name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.httpOnly !== false) parts.push("HttpOnly");
  parts.push(`Path=${opts.path ?? "/"}`);
  parts.push(`SameSite=${opts.sameSite ?? "Lax"}`);
  if (opts.secure ?? true) parts.push("Secure");
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
  res.setHeader("Set-Cookie", parts.join("; "));
}

export async function getAppState() {
  const { data, error } = await supabaseAdmin
    .from("app_state")
    .select("id, students_json, updated_at")
    .eq("id", "main")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { id: "main", students_json: [] };
  return data;
}

export async function setAppState(students_json) {
  const { error } = await supabaseAdmin
    .from("app_state")
    .upsert({ id: "main", students_json, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}
