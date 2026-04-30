import { useState, useEffect } from "react";
import { getAssignments, createAssignment, deleteAssignment, getClasses, getQuestions } from "../api/client";
import type { Assignment, Classroom, Question } from "../types";
import { useAuth } from "../context/AuthContext";

export default function AssignmentManagement() {
  const { isAdmin, isTeacher, user } = useAuth();
  const isStudent = user?.role === "student";
  const canManage = isAdmin || isTeacher;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state (teacher/admin only)
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ClassID: "", QuestID: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aData, cData, qData] = await Promise.all([
        getAssignments(),
        getClasses(),
        getQuestions(),
      ]);
      setAssignments(aData.assignments);
      setClasses(cData.classes);
      setQuestions(qData.questions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ClassID || !formData.QuestID) return;
    setSubmitting(true);
    try {
      await createAssignment({ ClassID: formData.ClassID, QuestID: formData.QuestID });
      setShowForm(false);
      setFormData({ ClassID: "", QuestID: "" });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("Remove this assignment?")) return;
    try {
      await deleteAssignment(assignmentId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete assignment");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading assignments...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "20px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Assignments</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {isStudent
                ? "Questions assigned to your class"
                : "Questions assigned to each class"}
            </p>
          </div>
          {canManage && (
            <button
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
              disabled={showForm}
            >
              + Assign Question
            </button>
          )}
        </div>

        {/* Error */}
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

        {/* Create form (teacher/admin only) */}
        {showForm && canManage && (
          <form
            onSubmit={handleCreate}
            style={{
              marginBottom: "20px",
              padding: "16px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: "1rem" }}>Assign a Question to a Class</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  Class *
                </label>
                <select
                  value={formData.ClassID}
                  onChange={(e) => setFormData({ ...formData, ClassID: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    backgroundColor: "var(--bg-input)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="">Select a class...</option>
                  {classes.map((c) => (
                    <option key={c.ClassID} value={c.ClassID}>
                      {c.ClassName} ({c.ClassID})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  Question *
                </label>
                <select
                  value={formData.QuestID}
                  onChange={(e) => setFormData({ ...formData, QuestID: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    backgroundColor: "var(--bg-input)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="">Select a question...</option>
                  {questions.map((q) => (
                    <option key={q.QuestID} value={q.QuestID}>
                      {q.QuestID} — {q.prompt.slice(0, 60)}{q.prompt.length > 60 ? "..." : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Assigning..." : "Assign"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setShowForm(false); setFormData({ ClassID: "", QuestID: "" }); setError(null); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Assignments list */}
        {assignments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            {isStudent
              ? "No assignments for your class yet."
              : "No assignments yet. Use the button above to assign a question to a class."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {!isStudent && <th>Class</th>}
                  {!isStudent && <th>Subject</th>}
                  <th>Question ID</th>
                  <th>Question Preview</th>
                  <th>Assigned At</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.AssignmentID}>
                    {!isStudent && (
                      <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                        {a.class_name || a.ClassID}
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>
                          {a.ClassID}
                        </div>
                      </td>
                    )}
                    {!isStudent && (
                      <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {a.class_subject || "—"}
                      </td>
                    )}
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>{a.QuestID}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: "320px" }}>
                      {a.question_prompt || "—"}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(a.assigned_at).toLocaleDateString()}
                    </td>
                    {canManage && (
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => handleDelete(a.AssignmentID)}
                          style={{ fontSize: "0.8rem", padding: "4px 12px", color: "var(--danger)" }}
                        >
                          Remove
                        </button>
                      </td>
                    )}
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
