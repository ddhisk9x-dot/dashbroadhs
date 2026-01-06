import { getAppState, json, parseCookies, verifySession, setAppState } from "./_utils.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const cookies = parseCookies(req);
  const sess = verifySession(cookies.dd_session);
  if (!sess || sess.role !== 'STUDENT') return json(res, 401, { error: "Unauthorized" });

  const { actionId, date, completed } = req.body ?? {};
  if (!actionId || !date) return json(res, 400, { error: "Missing fields" });

  const state = await getAppState();
  const students = Array.isArray(state.students_json) ? state.students_json : [];
  const idx = students.findIndex(s => String(s.mhs ?? "") === String(sess.username));
  if (idx < 0) return json(res, 404, { error: "Student not found" });

  const student = students[idx];
  const actions = Array.isArray(student.activeActions) ? student.activeActions : [];
  const aIdx = actions.findIndex(a => String(a.id) === String(actionId));
  if (aIdx < 0) return json(res, 404, { error: "Action not found" });

  const action = actions[aIdx];
  action.ticks = Array.isArray(action.ticks) ? action.ticks : [];
  const tIdx = action.ticks.findIndex(t => t.date === date);
  if (tIdx >= 0) action.ticks[tIdx].completed = !!completed;
  else action.ticks.push({ date, completed: !!completed });

  actions[aIdx] = action;
  student.activeActions = actions;
  students[idx] = student;

  await setAppState(students);
  return json(res, 200, { success: true });
}
