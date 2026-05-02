import { useState, useEffect, useRef } from "react";
import { getMyClasses, getClassAssignments, submitStudentAssignment, getSubmissions } from "../api/client";
import type { Classroom, Assignment, UploadResponse, Submission } from "../types";
import SearchBar from "./SearchBar";

export default function StudentClassView() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [aiResults, setAiResults] = useState<UploadResponse | null>(null);
  const [gradingStatus, setGradingStatus] = useState<Record<string, 'pending' | 'processing' | 'completed'>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchCls, setSearchCls] = useState("");
  const [searchAsg, setSearchAsg] = useState("");

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

  // Polling effect to check for grading completion
  useEffect(() => {
    if (!selectedClass || submissions.length === 0) return;
    
    const ungradedSubmissions = submissions.filter(s => !s.graded_at);
    if (ungradedSubmissions.length === 0) return;
    
    const pollGradingStatus = async () => {
      try {
        const submissionsData = await getSubmissions();
        setSubmissions(submissionsData.submissions);
        
        // Update grading status for each submission
        const newGradingStatus: Record<string, 'pending' | 'processing' | 'completed'> = {};
        submissionsData.submissions.forEach(sub => {
          const key = `${sub.student_id}-${sub.quest_id}`;
          if (sub.graded_at) {
            newGradingStatus[key] = 'completed';
          } else if (sub.plagiarism_risk_score > 0) {
            newGradingStatus[key] = 'processing';
          } else {
            newGradingStatus[key] = 'pending';
          }
        });
        setGradingStatus(newGradingStatus);
      } catch (err) {
        console.error("Error polling grading status:", err);
      }
    };
    
    // Poll every 5 seconds
    const intervalId = setInterval(pollGradingStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, [selectedClass, submissions]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);
    setAiResults(null);

    try {
      const result = await submitStudentAssignment(file, assignmentId);
      setUploadMessage({
        text: `Submitted successfully — Plagiarism: ${result.plagiarism_risk_score.toFixed(1)}%`,
        type: "success",
      });
      setAiResults(result);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadMessage({
        text: err instanceof Error ? err.message : "Submission failed",
        type: "error",
      });
      setAiResults(null);
    } finally {
      setUploading(false);
    }
  }
  
  // Polling effect to check for grading completion
  useEffect(() => {
    if (!selectedClass || submissions.length === 0) return;
      
    const ungradedSubmissions = submissions.filter(s => !s.graded_at);
    if (ungradedSubmissions.length === 0) return;
      
    const pollGradingStatus = async () => {
      try {
        const submissionsData = await getSubmissions();
        setSubmissions(submissionsData.submissions);
          
        // Update grading status for each submission
        const newGradingStatus: Record<string, 'pending' | 'processing' | 'completed'> = {};
        submissionsData.submissions.forEach(sub => {
          const key = `${sub.student_id}-${sub.quest_id}`;
          if (sub.graded_at) {
            newGradingStatus[key] = 'completed';
          } else if (sub.plagiarism_risk_score > 0) {
            newGradingStatus[key] = 'processing';
          } else {
            newGradingStatus[key] = 'pending';
          }
        });
        setGradingStatus(newGradingStatus);
      } catch (err) {
        console.error("Error polling grading status:", err);
      }
    };
      
    // Poll every 5 seconds
    const intervalId = setInterval(pollGradingStatus, 5000);
      
    return () => clearInterval(intervalId);
  }, [selectedClass, submissions]);
  
  const handleSelectClass = async (cls: Classroom) => {
    setSelectedClass(cls);
    setLoadingAssignments(true);
    setError(null);
    try {
      const data = await getClassAssignments(cls.ClassID);
      setAssignments(data.assignments);
      
      // Fetch submissions for this class
      const submissionsData = await getSubmissions();
      setSubmissions(submissionsData.submissions);
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

  const filteredClass = classes.filter(cls => {
    const searchStr = searchCls.toLowerCase();
    return (
      cls.ClassName.toLowerCase().includes(searchStr) ||
      cls.ClassID.toLowerCase().includes(searchStr) ||
      cls.ClassSubject.toLowerCase().includes(searchStr)
    );
  });
  const filteredAssignment = assignments.filter(asg => {
    const searchStr = searchAsg.toLowerCase();
    return (
      asg.QuestID.toLowerCase().includes(searchStr) ||
      asg.question_prompt?.toLowerCase().includes(searchStr)
    );
  });

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "5px" }}>
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
            
            <div style={{ width: "100%", maxWidth: "400px" }}>
              <SearchBar 
                placeholder="Search Question ID and Question Preview..." 
                onSearch={(val) => setSearchAsg(val)} 
              />
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
          ) : filteredAssignment.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
              No results found {searchAsg}
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
                    <th>Actions</th>
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
                      <td>
                        <label
                          htmlFor={`submit-${a.AssignmentID}`}
                          className="btn-primary"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 12px",
                            cursor: uploading ? "not-allowed" : "pointer",
                            opacity: uploading ? 0.5 : 1,
                          }}
                        >
                          {uploading ? "Submitting..." : "Upload File"}
                        </label>
                        <input
                          ref={fileInputRef}
                          id={`submit-${a.AssignmentID}`}
                          type="file"
                          accept=".pdf"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileChange(e, a.AssignmentID)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {uploadMessage && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: uploadMessage.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(244, 67, 54, 0.1)",
                border: `1px solid ${uploadMessage.type === "success" ? "var(--success)" : "var(--danger)"}`,
                borderRadius: "var(--radius)",
                color: uploadMessage.type === "success" ? "var(--success)" : "var(--danger)",
                fontSize: "0.875rem",
                marginTop: "16px",
              }}
            >
              {uploadMessage.text}
            </div>
          )}

          {aiResults && (
            <div style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "20px",
              marginTop: "16px"
            }}>
              <h3 style={{ fontSize: "1.125rem", margin: "0 0 16px 0" }}>AI Analysis Results</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                <div style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "16px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981", marginBottom: "4px" }}>
                    —
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    Gemini Grade
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>
                    Graded by teacher
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "16px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: aiResults.plagiarism_flagged ? "#ef4444" : "#3b82f6", marginBottom: "4px" }}>
                    {aiResults.plagiarism_risk_score}%
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    Plagiarism Risk
                  </div>
                  {aiResults.plagiarism_flagged && (
                    <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#ef4444", fontWeight: "bold" }}>
                      ⚠️ Flagged
                    </div>
                  )}
                </div>
                
                <div style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "16px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#94a3b8", marginBottom: "4px" }}>
                    —
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    Draft Feedback
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>
                    Provided after grading
                  </div>
                </div>
              </div>
            </div>
          )}

          {submissions.length > 0 && (
            <div style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "20px",
              marginTop: "16px"
            }}>
              <h3 style={{ fontSize: "1.125rem", margin: "0 0 16px 0" }}>Your Assignment Status</h3>
              
              {submissions.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                  No assignments found.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {submissions.map((submission, index) => {
                    const key = `${submission.student_id}-${submission.quest_id}`;
                    const status = gradingStatus[key] || 'pending';
                    
                    return (
                      <div key={`${submission.student_id}-${submission.quest_id}-${index}`} style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "16px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <div>
                            <h4 style={{ fontSize: "1rem", margin: "0 0 4px 0", color: "var(--accent)" }}>
                              {submission.quest_id}
                            </h4>
                            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                              Submitted: {new Date(submission.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span style={{
                            backgroundColor: status === 'completed' ? "rgba(16, 185, 129, 0.1)" : status === 'processing' ? "rgba(59, 130, 246, 0.1)" : "rgba(100, 116, 139, 0.1)",
                            color: status === 'completed' ? "#10b981" : status === 'processing' ? "#3b82f6" : "#64748b",
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            fontWeight: "bold"
                          }}>
                            {status === 'completed' ? "Graded" : status === 'processing' ? "Processing..." : "Pending"}
                          </span>
                        </div>
                        
                        {status === 'completed' ? (
                          <>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                              <div style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                padding: "12px 16px",
                                textAlign: "center"
                              }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981", marginBottom: "4px" }}>
                                  {submission.score}/100
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                  Gemini Grade
                                </div>
                              </div>
                              
                              <div style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                padding: "12px 16px",
                                textAlign: "center"
                              }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: submission.plagiarism_flagged ? "#ef4444" : "#3b82f6", marginBottom: "4px" }}>
                                  {submission.plagiarism_risk_score}%
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                  Plagiarism Risk
                                </div>
                                {submission.plagiarism_flagged && (
                                  <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#ef4444", fontWeight: "bold" }}>
                                    ⚠️ Flagged
                                  </div>
                                )}
                              </div>
                              
                              <div style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                padding: "12px 16px",
                                textAlign: "center"
                              }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#94a3b8", marginBottom: "4px" }}>
                                  {submission.draft_feedback ? "✓" : "—"}
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                  Draft Feedback
                                </div>
                              </div>
                            </div>
                            
                            {submission.draft_feedback && (
                              <div style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                padding: "16px",
                                marginTop: "16px"
                              }}>
                                <h4 style={{ fontSize: "1rem", margin: "0 0 8px 0", color: "var(--accent)" }}>Draft Feedback</h4>
                                <p style={{ fontSize: "0.875rem", lineHeight: "1.6", margin: 0 }}>
                                  {submission.draft_feedback}
                                </p>
                              </div>
                            )}
                          </>
                        ) : status === 'processing' ? (
                          <div style={{
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "16px",
                            textAlign: "center"
                          }}>
                            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "8px" }}>
                              ⏳ Processing by AI...
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                              Your submission is being analyzed for Gemini Grade, Plagiarism Risk, and Draft Feedback.
                            </div>
                            <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
                              <div style={{ width: "40px", height: "40px", border: "3px solid rgba(59, 130, 246, 0.3)", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "16px",
                            textAlign: "center"
                          }}>
                            <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#64748b", marginBottom: "8px" }}>
                              ⏳ Waiting for Processing
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                              Your submission has been received and is queued for AI analysis.
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
        <div style={{
          display: "flex", 
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "20px"
        }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>My Classes</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Click on a class to see its assignments
            </p>
          </div>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <SearchBar 
              placeholder="Search Classes by Name, ID and Subject..." 
              onSearch={(val) => setSearchCls(val)} 
            />
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

        {classes.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            You are not enrolled in any classes yet.
          </div>
        ) : filteredClass.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            No results found {searchCls}
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
