import { json, setCookie } from "./_utils.mjs";

export default async function handler(req, res) {
  // Clear cookie
  setCookie(res, "dd_session", "", { maxAge: 0, secure: true });
  return json(res, 200, { success: true });
}
