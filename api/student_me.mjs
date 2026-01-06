import { getAppState, json, parseCookies, verifySession } from "./_utils.mjs";

export default async function handler(req, res) {
  const cookies = parseCookies(req);
  const sess = verifySession(cookies.dd_session);
  if (!sess) return json(res, 401, { error: "Unauthorized" });

  if (sess.role !== 'STUDENT') return json(res, 403, { error: "Forbidden" });

  const state = await getAppState();
  const students = Array.isArray(state.students_json) ? state.students_json : [];
  const student = students.find(s => String(s.mhs ?? "") === String(sess.username));
  if (!student) return json(res, 404, { error: "Student not found" });

  return json(res, 200, { student });
}
