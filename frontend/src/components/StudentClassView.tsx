import { useState, useEffect } from "react";
import { getMyClasses, getClassAssignments } from "../api/client";
import type { Classroom, Assignment } from "../types";

export default function StudentClassView() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getMyClasses();
        setClasses(data.classes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your classes");
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleSelectClass = async (cls: Classroom) => {
    setSelectedClass(cls);
    setLoadingAssignments(true);
    setError(null);
    try {
      const data = await getClassAssignments(cls.ClassID);
      setAssignments(data.assignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleBack = () => {
    setSelectedClass(null);
    setAssignments([]);
    setError(null);
  };

  if (loadingClasses) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading your classes...
      </div>
    );
  }

  // ── Class detail view ────────────────────────────────────────────
  if (selectedClass) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <button
              onClick={handleBack}
              className="btn-secondary"
              style={{ fontSize: "0.875rem", padding: "6px 14px" }}
            >
              ← Back
            </button>
            <div>
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{selectedClass.ClassName}</h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                {selectedClass.ClassSubject} · {selectedClass.ClassID}
              </p>
            </div>
          </div>

          {error && (
            <div style={{
              padding: "12px 16px",
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius)",
              color: "var(--danger)",
              fontSize: "0.875rem",
              marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          {loadingAssignments ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
              No assignments for this class yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} in this class
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Question ID</th>
                    <th>Question Preview</th>
                    <th>Assigned At</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.AssignmentID}>
                      <td style={{ fontWeight: 600, color: "var(--accent)", whiteSpace: "nowrap" }}>
                        {a.QuestID}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: "400px" }}>
                        {a.question_prompt || "—"}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {new Date(a.assigned_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Class list view ──────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "20px",
      }}>
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>My Classes</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Click on a class to see its assignments
          </p>
        </div>

        {error && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: "rgba(244, 67, 54, 0.1)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius)",
            color: "var(--danger)",
            fontSize: "0.875rem",
            marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        {classes.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            You are not enrolled in any classes yet.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {classes.map((cls) => (
              <button
                key={cls.ClassID}
                onClick={() => handleSelectClass(cls)}
                style={{
                  textAlign: "left",
                  padding: "20px",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, background-color 0.2s ease",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.backgroundColor = "rgba(99,102,241,0.07)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.backgroundColor = "var(--bg-card)";
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "6px", color: "var(--accent)" }}>
                  {cls.ClassName}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                  {cls.ClassSubject}
                </div>
                <div style={{
                  display: "inline-block",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(99,102,241,0.15)",
                  color: "var(--accent)",
                }}>
                  {cls.ClassID}
                </div>
                <div style={{ marginTop: "12px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  View assignments →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
