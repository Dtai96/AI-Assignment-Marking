import { useEffect, useState } from "react";
import { getSubmissions, getAssignments, submitStudentAssignment, getMyClasses } from "../api/client";
import type { Submission, Assignment } from "../types";
import SearchBar from "./SearchBar";

interface SubmissionWithAssignment extends Submission {
  assignment?: Assignment;
  assignmentName?: string;
  className?: string;
}

export default function SubmittedAssignments() {
  const [submissions, setSubmissions] = useState<SubmissionWithAssignment[]>(
    [],
  );
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [submissionsData, assignmentsData, classesData] = await Promise.all([
          getSubmissions(),
          getAssignments(),
          getMyClasses(),
        ]);

        setAssignments(assignmentsData.assignments);

        // Enrich submissions with assignment information
        const enrichedSubmissions = submissionsData.submissions.map((sub) => {
          const relevantAssignments = assignmentsData.assignments.filter(
            (a) => a.QuestID === sub.quest_id,
          );
          const classNamesArray = relevantAssignments.map(a => {
            const classroom = classesData.classes.find(c => c.ClassID === a.ClassID);
            return classroom?.ClassName || "Unknown Class";
          });
          const primaryAssignment = relevantAssignments[0];
          return {
            ...sub,
            assignment: primaryAssignment,
            assignmentName: primaryAssignment?.question_prompt || sub.quest_id,
            className: classNamesArray.join(", "),
          };
        });

        setSubmissions(enrichedSubmissions);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load submissions",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = submissions.filter(sub => {
    const searchStr = searchTerm.toLowerCase();
    return (
      sub.className?.toLowerCase().includes(searchStr)
    );
  });

  if (loading) {
    return (
      <div
        style={{
          padding: "48px",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        Loading your submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          border: "1px solid var(--danger)",
          borderRadius: "var(--radius)",
          color: "var(--danger)",
          fontSize: "0.875rem",
        }}
      >
        {error}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "48px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📝</div>
        <h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>
          No Submissions Yet
        </h3>
        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: "0.875rem",
          }}
        >
          You haven't submitted any assignments. Go to the Classes tab to submit
          your work.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px",
        }}
      >

        <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
        >
          <h2 style={{ margin: "0 0 4px 0", fontSize: "1.25rem" }}>
            My Submissions
          </h2>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <SearchBar
            placeholder="Search Submissions by Class..."
            onSearch={(val) => setSearchTerm(val)}
            />
          </div>
        </div>
        
        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          {filteredData.length} submission{submissions.length !== 1 ? "s" : ""}{" "}
          total
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredData.map((submission, index) => {
            const submissionDate = new Date(submission.uploaded_at);
            const date = submissionDate.toLocaleDateString();
            const time = submissionDate.toLocaleTimeString();
            const isGraded = submission.graded_at !== null;
            const score = submission.score;

            // Determine status
            let status = "Pending";
            let statusColor = "#64748b";
            let statusBg = "rgba(100, 116, 139, 0.1)";

            if (isGraded) {
              status = "Graded";
              statusColor = "#10b981";
              statusBg = "rgba(16, 185, 129, 0.1)";
            } else if (submission.plagiarism_risk_score > 0) {
              status = "Processing";
              statusColor = "#3b82f6";
              statusBg = "rgba(59, 130, 246, 0.1)";
            }

            return (
              <div
                key={`${submission.student_id}-${submission.quest_id}-${index}`}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "20px",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Header with Assignment Name and Status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--accent)",
                      }}
                    >
                      {submission.quest_id}
                    </h3>
                    {submission.assignment?.question_prompt && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          lineHeight: "1.4",
                        }}
                      >
                        {submission.assignment.question_prompt.substring(0, 60)}
                        {submission.assignment.question_prompt.length > 60
                          ? "..."
                          : ""}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      backgroundColor: statusBg,
                      color: statusColor,
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {status}
                  </span>
                </div>

                {/* Submission Date and Time */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "16px",
                    padding: "12px",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        marginBottom: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      Submission Date
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {date}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        marginBottom: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      Submission Time
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {time}
                    </div>
                  </div>
                </div>

                {/* Score and Plagiarism Info */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isGraded ? "1fr 1fr" : "1fr",
                    gap: "12px",
                  }}
                >
                  {isGraded && (
                    <div
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "12px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          color:
                            score !== null && score >= 50
                              ? "#10b981"
                              : "#ef4444",
                          marginBottom: "4px",
                        }}
                      >
                        {score !== null ? `${score}/100` : "N/A"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          fontWeight: 500,
                        }}
                      >
                        Score
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: submission.plagiarism_flagged
                          ? "#ef4444"
                          : "#3b82f6",
                        marginBottom: "4px",
                      }}
                    >
                      {submission.plagiarism_risk_score}%
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      Plagiarism Risk
                    </div>
                    {submission.plagiarism_flagged && (
                      <div
                        style={{
                          marginTop: "4px",
                          fontSize: "0.7rem",
                          color: "#ef4444",
                          fontWeight: "bold",
                        }}
                      >
                        ⚠️ Flagged
                      </div>
                    )}
                  </div>
                </div>

                {/* Graded At Info */}
                {isGraded && submission.graded_at && (
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textAlign: "center",
                    }}
                  >
                    Graded on{" "}
                    {new Date(submission.graded_at).toLocaleDateString()} at{" "}
                    {new Date(submission.graded_at).toLocaleTimeString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
