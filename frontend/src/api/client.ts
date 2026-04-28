const API_BASE = "http://localhost:8000/api";

import type {
  SubmissionListResponse,
  UploadResponse,
  GradeResponse,
  GradeAllResponse,
  StudentListResponse,
  QuestionListResponse,
  Student,
  Question,
} from "../types";

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

export async function register(username: string, email: string, full_name: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, full_name, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Registration failed');
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
  const res = await fetch(`${API_BASE}/submissions`);
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
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function gradeSubmission(studentId: string, questId: string = "Q001"): Promise<GradeResponse> {
  const res = await fetch(`${API_BASE}/grade/${studentId}?quest_id=${questId}`, {
    method: "POST",
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
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Grade all failed");
  }
  return res.json();
}

// Student endpoints
export async function getStudents(): Promise<StudentListResponse> {
  const res = await fetch(`${API_BASE}/students`);
  if (!res.ok) throw new Error(`Failed to fetch students: ${res.statusText}`);
  return res.json();
}

export async function createStudent(student: Student): Promise<{ student: Student; message: string }> {
  const res = await fetch(`${API_BASE}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
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
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to delete student");
  }
  return res.json();
}

// Question endpoints
export async function getQuestions(): Promise<QuestionListResponse> {
  const res = await fetch(`${API_BASE}/questions`);
  if (!res.ok) throw new Error(`Failed to fetch questions: ${res.statusText}`);
  return res.json();
}

export async function createQuestion(question: Question): Promise<{ question: Question; message: string }> {
  const res = await fetch(`${API_BASE}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
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
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to delete question");
  }
  return res.json();
}
