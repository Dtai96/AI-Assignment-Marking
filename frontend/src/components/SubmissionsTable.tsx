import { useState } from "react";
import type { Submission } from "../types";
import { gradeSubmission } from "../api/client";
import PlagiarismBadge from "./PlagiarismBadge";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";

interface SubmissionsTableProps {
  submissions: Submission[];
  onGradeComplete: () => void;
}

export default function SubmissionsTable({ submissions, onGradeComplete }: SubmissionsTableProps) {
  const { isStudent } = useAuth();
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleGrade = async (studentId: string, questId: string) => {
    setGradingId(studentId);
    try {
      await gradeSubmission(studentId, questId);
      onGradeComplete();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Grading failed");
    } finally {
      setGradingId(null);
    }
  };

  const filteredData = submissions.filter(sub => {
    const searchStr = searchTerm.toLowerCase();
    return (
      sub.student_id.toLowerCase().includes(searchStr) ||
      sub.quest_id.toLowerCase().includes(searchStr)
    );
  });

  if (submissions.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 20px",
          color: "var(--text-muted)",
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
      >
        No submissions yet. Upload a PDF to get started.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <SearchBar 
        placeholder="Search Student ID or Question ID..." 
        onSearch={(val) => setSearchTerm(val)} 
      />

      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {filteredData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
            {searchTerm 
              ? `No results found for "${searchTerm}"` 
              : "No submissions yet. Upload a PDF to get started."}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Question ID</th>
                <th>Gemini Grade</th>
                <th>Plagiarism Risk</th>
                <th>Draft Feedback</th>
                {!isStudent && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((sub) => ( //Thay submissions bằng filteredata để hiện các submissions có từ khóa liên quan
                <tr key={`${sub.student_id}-${sub.quest_id}`}>
                  <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                    {sub.student_id}
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                    {sub.quest_id}
                  </td>
                  <td>
                    {sub.score !== null ? (
                      <span style={{ fontWeight: 600, fontSize: "1rem" }}>
                        {sub.score}
                        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>/100</span>
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>Not graded</span>
                    )}
                  </td>
                  <td>
                    <PlagiarismBadge score={sub.plagiarism_risk_score} />
                  </td>
                  <td
                    style={{
                      maxWidth: "400px",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {sub.draft_feedback || (
                      <span style={{ color: "var(--text-muted)" }}>--</span>
                    )}
                  </td>
                  {!isStudent && (
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => handleGrade(sub.student_id, sub.quest_id)}
                        disabled={gradingId === sub.student_id}
                        style={{ fontSize: "0.8rem" }}
                      >
                        {gradingId === sub.student_id ? "Grading..." : sub.score !== null ? "Re-grade" : "Grade"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
