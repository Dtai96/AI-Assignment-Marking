import { useState, useRef, useEffect } from "react";
import { uploadPdf } from "../api/client";
import { getQuestions } from "../api/client";
import type { Question } from "../types";

interface FileUploadProps {
  onUploadComplete: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState("Q001");
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions();
        setQuestions(data.questions);
        if (data.questions.length > 0) {
          setSelectedQuestId(data.questions[0].QuestID);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const result = await uploadPdf(file, selectedQuestId);
      setMessage({
        text: `Uploaded ${result.student_id} — Plagiarism: ${result.plagiarism_risk_score.toFixed(1)}%`,
        type: "success",
      });
      onUploadComplete();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Upload failed",
        type: "error",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 20px",
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Question:</label>
        <select
          value={selectedQuestId}
          onChange={(e) => setSelectedQuestId(e.target.value)}
          disabled={loadingQuestions || uploading}
          style={{ padding: "8px", border: "1px solid var(--border)", borderRadius: "4px" }}
        >
          {loadingQuestions ? (
            <option>Loading...</option>
          ) : questions.length === 0 ? (
            <option value="Q001">Q001 (Default)</option>
          ) : (
            questions.map((q) => (
              <option key={q.QuestID} value={q.QuestID}>
                {q.QuestID}
              </option>
            ))
          )}
        </select>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        id="pdf-upload"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <label
        htmlFor="pdf-upload"
        className="btn-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.5 : 1,
        }}
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </label>
      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
        Format: S&lt;digits&gt;_name.pdf
      </span>
      {message && (
        <span
          style={{
            fontSize: "0.85rem",
            color: message.type === "success" ? "var(--success)" : "var(--danger)",
            marginLeft: "auto",
          }}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
