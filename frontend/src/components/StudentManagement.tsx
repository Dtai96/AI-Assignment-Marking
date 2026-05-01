import { useState, useEffect } from "react";
import { getStudents, createStudent, updateStudent, deleteStudent, getClasses, getClassmates, addClassmate, removeClassmate } from "../api/client";
import type { Student, Classroom, Classmate } from "../types";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";

interface StudentManagementProps {
  onStudentAdded?: () => void;
}

export default function StudentManagement({ onStudentAdded }: StudentManagementProps) {
  const { hasPermission } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ StudentID: "", Name: "", UserID: "" });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Enrollment panel state
  const [enrollingStudent, setEnrollingStudent] = useState<Student | null>(null);
  const [enrollClassID, setEnrollClassID] = useState("");

  const fetchStudents = async () => {
    try {
      const [sData, cData, cmData] = await Promise.all([getStudents(), getClasses(), getClassmates()]);
      setStudents(sData.students);
      setClasses(cData.classes);
      setClassmates(cmData.classmates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = students.filter(student => {
    const searchStr = searchTerm.toLowerCase();
    return (
      student.StudentID.toLowerCase().includes(searchStr) ||
      student.Name.toLowerCase().includes(searchStr)
    );
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.StudentID, { ...formData, UserID: formData.UserID || null });
      } else {
        await createStudent({ ...formData, UserID: formData.UserID || null });
      }
      setShowForm(false);
      setEditingStudent(null);
      setFormData({ StudentID: "", Name: "", UserID: "" });
      await fetchStudents();
      onStudentAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ StudentID: student.StudentID, Name: student.Name, UserID: student.UserID || "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setFormData({ StudentID: "", Name: "", UserID: "" });
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollingStudent || !enrollClassID) return;
    try {
      await addClassmate({ StudentID: enrollingStudent.StudentID, ClassroomID: enrollClassID });
      setEnrollingStudent(null);
      setEnrollClassID("");
      await fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll student");
    }
  };

  const handleUnenroll = async (mateId: string) => {
    if (!confirm("Remove this enrollment?")) return;
    try {
      await removeClassmate(mateId);
      await fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove enrollment");
    }
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading students...</div>;
  }

  if (students.length == 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
            No students yet. Add your first student to get started.
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <SearchBar 
        placeholder="Search Student ID or Name..." 
        onSearch={(val) => setSearchTerm(val)} 
      />
      <div style={{ backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Students</h2>
          {(hasPermission('create_students')) && (
            <button className="btn-primary" onClick={() => setShowForm(true)} disabled={showForm}>
              Add Student
            </button>
          )}
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
                <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem" }}>User ID (optional)</label>
                <input
                  type="text"
                  value={formData.UserID}
                  onChange={(e) => setFormData({ ...formData, UserID: e.target.value })}
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "4px" }}
                  placeholder="Link to a user account (optional)"
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

        {filteredData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
            No results found {searchTerm}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Enrolled Classes</th>
                  <th>User Account</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((student) => {
                  const studentClasses = classmates.filter(cm => cm.StudentID === student.StudentID);
                  return (
                    <tr key={student.StudentID}>
                      <td style={{ fontWeight: 600, color: "var(--accent)" }}>{student.StudentID}</td>
                      <td>{student.Name}</td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                          {studentClasses.map(cm => {
                            const cls = classes.find(c => c.ClassID === cm.ClassroomID);
                            return (
                              <span key={cm.MateID} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", backgroundColor: "rgba(59,130,246,0.15)", borderRadius: "12px", fontSize: "0.75rem", color: "var(--accent)" }}>
                                {cls ? cls.ClassName : cm.ClassroomID}
                                {hasPermission('update_students') && (
                                  <button
                                    onClick={() => handleUnenroll(cm.MateID)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "0.75rem", padding: "0 2px", lineHeight: 1 }}
                                    title="Remove from class"
                                  >×</button>
                                )}
                              </span>
                            );
                          })}
                          {hasPermission('update_students') && (
                            <button
                              className="btn-secondary"
                              onClick={() => { setEnrollingStudent(student); setEnrollClassID(""); }}
                              style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                            >+ Enroll</button>
                          )}
                        </div>
                        {enrollingStudent?.StudentID === student.StudentID && (
                          <form onSubmit={handleEnroll} style={{ display: "flex", gap: "6px", marginTop: "6px", alignItems: "center" }}>
                            <select
                              value={enrollClassID}
                              onChange={e => setEnrollClassID(e.target.value)}
                              required
                              style={{ padding: "4px 6px", fontSize: "0.8rem", backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-primary)" }}
                            >
                              <option value="">Select class...</option>
                              {classes
                                .filter(c => !studentClasses.some(cm => cm.ClassroomID === c.ClassID))
                                .map(c => <option key={c.ClassID} value={c.ClassID}>{c.ClassName} ({c.ClassID})</option>)
                              }
                            </select>
                            <button type="submit" className="btn-primary" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>Add</button>
                            <button type="button" className="btn-secondary" onClick={() => setEnrollingStudent(null)} style={{ fontSize: "0.75rem", padding: "4px 10px" }}>Cancel</button>
                          </form>
                        )}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{student.UserID ? "Linked" : "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {(hasPermission('update_students')) && (
                            <button className="btn-secondary" onClick={() => handleEdit(student)} style={{ fontSize: "0.8rem", padding: "4px 12px" }}>
                              Edit
                            </button>
                          )}
                          {(hasPermission('delete_students')) && (
                            <button className="btn-secondary" onClick={() => handleDelete(student.StudentID)} style={{ fontSize: "0.8rem", padding: "4px 12px", color: "var(--danger)" }}>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
