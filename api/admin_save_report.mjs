import { getAppState, json, parseCookies, verifySession, setAppState } from "./_utils.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const cookies = parseCookies(req);
  const sess = verifySession(cookies.dd_session);
  if (!sess || sess.role !== 'TEACHER') return json(res, 401, { error: "Unauthorized" });

  const { mhs, aiReport, activeActions } = req.body ?? {};
  if (!mhs) return json(res, 400, { error: "Missing mhs" });

  const state = await getAppState();
  const students = Array.isArray(state.students_json) ? state.students_json : [];
  const idx = students.findIndex(s => String(s.mhs ?? "") === String(mhs));
  if (idx < 0) return json(res, 404, { error: "Student not found" });

  if (aiReport) students[idx].aiReport = aiReport;
  if (Array.isArray(activeActions)) students[idx].activeActions = activeActions;

  await setAppState(students);
  return json(res, 200, { success: true });
}
