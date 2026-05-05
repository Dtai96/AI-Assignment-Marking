import { useEffect, useState } from "react";
import { getSubmissions } from "../api/client";

interface Submission {
  student_id: string;
  quest_id: string;
  score: number | null;
  draft_feedback: string | null;
  uploaded_at: string;
  filename: string;
}

export default function SubmittedAssignments() {
  const [data, setData] = useState<Submission[]>([]);

  useEffect(() => {
    getSubmissions()
      .then(res => setData(res.submissions))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Bài đã nộp</h2>

      {data.length === 0 ? (
        <p>Chưa có bài nộp</p>
      ) : (
        data.map(item => (
          <div key={item.student_id + item.quest_id}>
            <h3>{item.quest_id}</h3>
            <p>Điểm: {item.score ?? "Chưa chấm"}</p>
            <p>{item.uploaded_at}</p>
          </div>
        ))
      )}
    </div>
  );
}