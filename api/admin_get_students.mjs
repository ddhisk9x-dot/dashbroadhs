import { getAppState, json, parseCookies, verifySession } from "./_utils.mjs";

export default async function handler(req, res) {
  const cookies = parseCookies(req);
  const sess = verifySession(cookies.dd_session);
  if (!sess || sess.role !== 'TEACHER') return json(res, 401, { error: "Unauthorized" });

  const state = await getAppState();
  return json(res, 200, { students: state.students_json ?? [] });
}
