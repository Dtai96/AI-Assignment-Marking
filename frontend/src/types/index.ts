export interface Classroom {
  ClassID: string;
  ClassName: string;
  ClassSubject: string;
}

export interface Student {
  StudentID: string;
  Name: string;
  ClassID: string;
  UserID?: string | null;
}

export interface Assignment {
  AssignmentID: string;
  ClassID: string;
  QuestID: string;
  assigned_at: string;
  class_name?: string | null;
  class_subject?: string | null;
  question_prompt?: string | null;
}

export interface Question {
  QuestID: string;
  prompt: string;
  rubric: string;
}

export interface Submission {
  student_id: string;
  quest_id: string;
  filename: string;
  uploaded_at: string;
  score: number | null;
  draft_feedback: string | null;
  plagiarism_risk_score: number;
  plagiarism_flagged: boolean;
  graded_at: string | null;
}

export interface UploadResponse {
  student_id: string;
  filename: string;
  plagiarism_risk_score: number;
  plagiarism_flagged: boolean;
  message: string;
}

export interface GradeResponse {
  student_id: string;
  quest_id: string;
  score: number;
  draft_feedback: string;
  graded_at: string;
}

export interface GradeAllResult {
  student_id: string;
  score: number | null;
  success: boolean;
  error?: string;
}

export interface GradeAllResponse {
  graded_count: number;
  failed_count: number;
  results: GradeAllResult[];
}

export interface SubmissionListResponse {
  submissions: Submission[];
  total: number;
  ungraded_count: number;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
}

export interface QuestionListResponse {
  questions: Question[];
  total: number;
}

export interface ClassListResponse {
  classes: Classroom[];
  total: number;
}

export interface AssignmentListResponse {
  assignments: Assignment[];
  total: number;
}
