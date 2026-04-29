import { useState, useEffect } from "react";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from "../api/client";
import type { Question } from "../types";
import SearchBar from "./SearchBar";
import RubricAccordion from "./RubricAccordion";

interface QuestionManagementProps {
  onQuestionAdded?: () => void;
}

export default function QuestionManagement({ onQuestionAdded }: QuestionManagementProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({ QuestID: "", prompt: "", rubric: "" });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(data.questions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = questions.filter(question => {
    const searchStr = searchTerm.toLowerCase();
    return (
      question.QuestID.toLowerCase().includes(searchStr) ||
      question.prompt.toLowerCase().includes(searchStr)
    );
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.QuestID, formData);
      } else {
        await createQuestion(formData);
      }
      setShowForm(false);
      setEditingQuestion(null);
      setFormData({ QuestID: "", prompt: "", rubric: "" });
      await fetchQuestions();
      onQuestionAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData(question);
    setShowForm(true);
  };

  const handleDelete = async (questId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await deleteQuestion(questId);
      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete question");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setFormData({ QuestID: "", prompt: "", rubric: "" });
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading questions...</div>;
  }

  if (questions.length == 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
          No questions yet. Add your first question to get started.
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <SearchBar 
        placeholder="Search Student ID, Name or Class..." 
        onSearch={(val) => setSearchTerm(val)} 
      />
      <div style={{ backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Questions</h2>
          <button className="btn-primary" onClick={() => setShowForm(true)} disabled={showForm}>
            Add Question
          </button>
        </div>

        {error && (
          <div style={{ padding: "12px", backgroundColor: "rgba(244, 67, 54, 0.1)", border: "1px solid var(--danger)", borderRadius: "var(--radius)", color: "var(--danger)", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius)" }}>
            <h3 style={{ marginTop: 0 }}>{editingQuestion ? "Edit Question" : "Add New Question"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem" }}>Question ID *</label>
                <input
                  type="text"
                  value={formData.QuestID}
                  onChange={(e) => setFormData({ ...formData, QuestID: e.target.value })}
                  required
                  disabled={!!editingQuestion}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "4px" }}
                  placeholder="e.g., Q001"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem" }}>Prompt</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "4px", resize: "vertical" }}
                  placeholder="Question prompt/description"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem" }}>Rubric *</label>
                <RubricAccordion
                  value={formData.rubric}
                  onChange={(rubricText) => setFormData({ ...formData, rubric: rubricText })}
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" className="btn-primary">
                  {editingQuestion ? "Update" : "Create"}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {filteredData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
            No results found {searchTerm}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Question ID</th>
                  <th>Prompt</th>
                  <th>Rubric</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((question) => (
                  <tr key={question.QuestID}>
                    <td style={{ fontWeight: 600, color: "var(--accent)" }}>{question.QuestID}</td>
                    <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {question.prompt || "--"}
                    </td>
                    <td style={{ maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {question.rubric}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn-secondary" onClick={() => handleEdit(question)} style={{ fontSize: "0.8rem", padding: "4px 12px" }}>
                          Edit
                        </button>
                        <button className="btn-secondary" onClick={() => handleDelete(question.QuestID)} style={{ fontSize: "0.8rem", padding: "4px 12px", color: "var(--danger)" }}>
                          Delete
                        </button>
                      </div>
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
