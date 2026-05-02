const API_BASE = "http://localhost:8000/api";

import type {
  SubmissionListResponse,
  UploadResponse,
  GradeResponse,
  GradeAllResponse,
  StudentListResponse,
  QuestionListResponse,
  ClassListResponse,
  ClassmateListResponse,
  AssignmentListResponse,
  Student,
  Question,
  Classroom,
  Classmate,
  Assignment,
} from "../types/index.ts";

// Authentication token management
let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken(): string | null {
  return authToken;
}

// Helper function to get headers with auth token
function getAuthHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...additionalHeaders };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// Auth API functions
export async function login(username: string, password: string) {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Login failed');
  }

  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to get user info');
  }

  return res.json();
}

export async function getSubmissions(): Promise<SubmissionListResponse> {
  const res = await fetch(`${API_BASE}/submissions`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch submissions: ${res.statusText}`);
  return res.json();
}

export async function uploadPdf(file: File, questId: string = "Q001"): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("quest_id", questId);
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function submitStudentAssignment(file: File, assignmentId: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("assignment_id", assignmentId);
  const res = await fetch(`${API_BASE}/student/submit`, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Submission failed");
  }
  return res.json();
}

export async function gradeSubmission(studentId: string, questId: string = "Q001"): Promise<GradeResponse> {
  const res = await fetch(`${API_BASE}/grade/${studentId}?quest_id=${questId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Grading failed");
  }
  return res.json();
}

export async function gradeAll(): Promise<GradeAllResponse> {
  const res = await fetch(`${API_BASE}/grade-all`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Grade all failed");
  }
  return res.json();
}

// Student endpoints
export async function getStudents(): Promise<StudentListResponse> {
  const res = await fetch(`${API_BASE}/students`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch students: ${res.statusText}`);
  return res.json();
}

export async function createStudent(student: Student): Promise<{ student: Student; message: string }> {
  const res = await fetch(`${API_BASE}/students`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(student),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to create student");
  }
  return res.json();
}

export async function updateStudent(studentId: string, student: Student): Promise<{ student: Student; message: string }> {
  const res = await fetch(`${API_BASE}/students/${studentId}`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(student),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to update student");
  }
  return res.json();
}

export async function deleteStudent(studentId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/students/${studentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to delete student");
  }
  return res.json();
}

// Question endpoints
export async function getQuestions(): Promise<QuestionListResponse> {
  const res = await fetch(`${API_BASE}/questions`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch questions: ${res.statusText}`);
  return res.json();
}

export async function createQuestion(question: Question): Promise<{ question: Question; message: string }> {
  const res = await fetch(`${API_BASE}/questions`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(question),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to create question");
  }
  return res.json();
}

export async function updateQuestion(questId: string, question: Question): Promise<{ question: Question; message: string }> {
  const res = await fetch(`${API_BASE}/questions/${questId}`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(question),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to update question");
  }
  return res.json();
}

export async function deleteQuestion(questId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/questions/${questId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to delete question");
  }
  return res.json();
}

// Change password
export async function changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to change password');
  }

  return res.json();
}

// Admin: User management endpoints
export async function getAllUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }

  return res.json();
}

export async function createUser(userData: {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
}) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to create user');
  }

  return res.json();
}

export async function updateUser(
  userId: string,
  userData: { role: string; is_active: boolean }
) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to update user');
  }

  return res.json();
}

export async function deleteUser(userId: string) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to delete user');
  }

  return res.json();
}

// Class endpoints
export async function getClasses(): Promise<ClassListResponse> {
  const res = await fetch(`${API_BASE}/classes`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch classes: ${res.statusText}`);
  return res.json();
}

export async function createClass(data: Classroom): Promise<{ class: Classroom; message: string }> {
  const res = await fetch(`${API_BASE}/classes`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to create class');
  }
  return res.json();
}

export async function updateClass(classId: string, data: Classroom): Promise<{ class: Classroom; message: string }> {
  const res = await fetch(`${API_BASE}/classes/${classId}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to update class');
  }
  return res.json();
}

export async function deleteClass(classId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/classes/${classId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to delete class');
  }
  return res.json();
}

// Classmate (enrollment) endpoints
export async function getMyClasses(): Promise<ClassListResponse> {
  const res = await fetch(`${API_BASE}/classmates/my-classes`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch enrolled classes: ${res.statusText}`);
  return res.json();
}

export async function getClassmates(): Promise<ClassmateListResponse> {
  const res = await fetch(`${API_BASE}/classmates`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch classmates: ${res.statusText}`);
  return res.json();
}

export async function addClassmate(data: { StudentID: string; ClassroomID: string }): Promise<{ classmate: Classmate; message: string }> {
  const res = await fetch(`${API_BASE}/classmates`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to enroll student');
  }
  return res.json();
}

export async function removeClassmate(mateId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/classmates/${mateId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to remove enrollment');
  }
  return res.json();
}

export async function getClassAssignments(classId: string): Promise<AssignmentListResponse> {
  const res = await fetch(`${API_BASE}/classes/${classId}/assignments`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch class assignments: ${res.statusText}`);
  return res.json();
}

// Assignment endpoints
export async function getAssignments(): Promise<AssignmentListResponse> {
  const res = await fetch(`${API_BASE}/assignments`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch assignments: ${res.statusText}`);
  return res.json();
}

export async function createAssignment(data: { ClassID: string; QuestID: string }): Promise<{ assignment: Assignment; message: string }> {
  const res = await fetch(`${API_BASE}/assignments`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to create assignment');
  }
  return res.json();
}

export async function deleteAssignment(assignmentId: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/assignments/${assignmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to delete assignment');
  }
  return res.json();
}
