import { Student, AIReport } from "../types";
import { api } from "./api";

// Client no longer calls Gemini directly. Gemini runs server-side in /api/ai_generate_report.
export async function generateStudentReport(student: Student): Promise<AIReport> {
  return await api.generateReport(student);
}
