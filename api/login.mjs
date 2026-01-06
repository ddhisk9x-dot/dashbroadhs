import { getAppState, json, setCookie, signSession } from "./_utils.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const { username, password } = req.body ?? {};
  const u = String(username ?? "").trim();
  const p = String(password ?? "").trim();

  if (!u || !p) return json(res, 400, { error: "Thiếu thông tin đăng nhập." });

  // Admin
  if (u === "admin" && p === "admin") {
    const payload = { role: 'TEACHER', username: "admin", exp: Date.now() + 7 * 24 * 3600 * 1000 };
    setCookie(res, "dd_session", signSession(payload), { maxAge: 7 * 24 * 3600, secure: true });
    return json(res, 200, { success: true, user: { username: "admin", name: "Giáo viên", role: 'TEACHER' } });
  }

  // Student: password must equal MHS (case-insensitive)
  const state = await getAppState();
  const students = Array.isArray(state.students_json) ? state.students_json : [];
  const student = students.find(s => String(s.mhs ?? "").toLowerCase() === u.toLowerCase());

  if (!student) return json(res, 401, { success: false, error: "Không tìm thấy Mã học sinh." });

  if (p.toLowerCase() !== u.toLowerCase()) {
    return json(res, 401, { success: false, error: "Mật khẩu sai (mật khẩu mặc định = MHS)." });
  }

  const payload = { role: 'STUDENT', username: student.mhs, exp: Date.now() + 7 * 24 * 3600 * 1000 };
  setCookie(res, "dd_session", signSession(payload), { maxAge: 7 * 24 * 3600, secure: true });

  return json(res, 200, { success: true, user: { username: student.mhs, name: student.name, role: 'STUDENT' } });
}
