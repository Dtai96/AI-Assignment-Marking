import { useState, useEffect } from "react";
import { getStudents, createStudent, updateStudent, deleteStudent } from "../api/client";
import type { Student } from "../types";

interface StudentManagementProps {
  onStudentAdded?: () => void;
}

export default function StudentManagement({ onStudentAdded }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ StudentID: "", Name: "", Class: "" });
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data.students);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.StudentID, formData);
      } else {
        await createStudent(formData);
      }
      setShowForm(false);
      setEditingStudent(null);
      setFormData({ StudentID: "", Name: "", Class: "" });
      await fetchStudents();
      onStudentAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setShowForm(true);
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await deleteStudent(studentId);
      await fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
    setFormData({ StudentID: "", Name: "", Class: "" });
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading students...</div>;
  }

  return (
    <div style={{ backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Students</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)} disabled={showForm}>
          Add Student
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px", backgroundColor: "rgba(244, 67, 54, 0.1)", border: "1px solid var(--danger)", borderRadius: "var(--radius)", color: "var(--danger)", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius)" }}>
          <h3 style={{ marginTop: 0 }}>{editingStudent ? "Edit Student" : "Add New Student"}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem" }}>Student ID *</label>
              <input
                type="text"
                value={formData.StudentID}
                onChange={(e) => setFormData({ ...formData, StudentID: e.target.value })}
                required
                disabled={!!editingStudent}
                style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "4px" }}
                placeholder="e.g., S10485739"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem" }}>Name *</label>
              <input
                type="text"
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                required
                style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "4px" }}
                placeholder="Student name"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem" }}>Class *</label>
              <input
                type="text"
                value={formData.Class}
                onChange={(e) => setFormData({ ...formData, Class: e.target.value })}
                required
                style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "4px" }}
                placeholder="e.g., CS101"
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn-primary">
                {editingStudent ? "Update" : "Create"}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {students.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
          No students yet. Add your first student to get started.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.StudentID}>
                  <td style={{ fontWeight: 600, color: "var(--accent)" }}>{student.StudentID}</td>
                  <td>{student.Name}</td>
                  <td>{student.Class}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-secondary" onClick={() => handleEdit(student)} style={{ fontSize: "0.8rem", padding: "4px 12px" }}>
                        Edit
                      </button>
                      <button className="btn-secondary" onClick={() => handleDelete(student.StudentID)} style={{ fontSize: "0.8rem", padding: "4px 12px", color: "var(--danger)" }}>
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
  );
}
