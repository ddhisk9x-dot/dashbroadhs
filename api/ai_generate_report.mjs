import { json, parseCookies, verifySession } from "./_utils.mjs";
import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    overview: { type: Type.STRING },
    riskLevel: { type: Type.STRING, enum: ["Thấp", "Trung bình", "Cao"] },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    risks: { type: Type.ARRAY, items: { type: Type.STRING } },
    bySubject: {
      type: Type.OBJECT,
      properties: {
        math: { type: Type.STRING },
        literature: { type: Type.STRING },
        english: { type: Type.STRING }
      }
    },
    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
    studyPlan2Weeks: { type: Type.ARRAY, items: { type: Type.STRING } },
    messageToStudent: { type: Type.STRING },
    teacherNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
    disclaimer: { type: Type.STRING }
  },
  required: ["overview","riskLevel","actions","disclaimer"]
};

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const cookies = parseCookies(req);
  const sess = verifySession(cookies.dd_session);
  if (!sess) return json(res, 401, { error: "Unauthorized" });

  // allow teacher or student
  if (!['TEACHER', 'STUDENT'].includes(sess.role)) return json(res, 403, { error: "Forbidden" });

  if (!GEMINI_API_KEY) return json(res, 500, { error: "Missing GEMINI_API_KEY" });

  const { student } = req.body ?? {};
  if (!student) return json(res, 400, { error: "Missing student" });

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = `Bạn là trợ lý học tập cho giáo viên. Dữ liệu điểm theo tháng (Toán/Văn/Anh) của một học sinh được cung cấp dưới dạng JSON. 
Nhiệm vụ: viết nhận xét ngắn gọn, nêu điểm mạnh/yếu, rủi ro; đề xuất 3-5 biện pháp đo được và kế hoạch 2 tuần. 
Ràng buộc: không chẩn đoán tâm lý, không gắn nhãn tiêu cực, nếu nói nguyên nhân thì dưới dạng "có thể". 
Trả về JSON đúng schema. 
Dữ liệu: ${JSON.stringify(student)}`;

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: reportSchema }
  });

  try {
    const obj = JSON.parse(resp.text);
    return json(res, 200, { report: obj });
  } catch {
    return json(res, 500, { error: "Gemini returned non-JSON", raw: resp.text });
  }
}
