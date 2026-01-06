import { json, parseCookies, verifySession, setAppState } from "./_utils.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const cookies = parseCookies(req);
  const sess = verifySession(cookies.dd_session);
  if (!sess || sess.role !== 'TEACHER') return json(res, 401, { error: "Unauthorized" });

  const { students } = req.body ?? {};
  if (!Array.isArray(students)) return json(res, 400, { error: "Invalid students payload" });

  await setAppState(students);
  return json(res, 200, { success: true, count: students.length });
}
