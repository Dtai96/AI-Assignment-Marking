import { GraduationCapIcon } from './Icons';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1e1e2f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1100px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '60px',
        flexWrap: 'wrap'
      }}>
        {/* Bên trái: Giới thiệu */}
        <div style={{ flex: '1 1 450px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <GraduationCapIcon size={48} color="var(--accent)" />
            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>AI Assignment Marking</h1>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Automated scoring using AI
          </h2>
          
          <p style={{ color: 'var(--text-main)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '32px' }}>
            Tutor Feedback Engine giúp giảng viên chấm điểm bài làm PDF của sinh viên một cách nhanh chóng. 
            Sử dụng Gemini AI để phân tích nội dung, phát hiện đạo văn, chấm điểm và cung cấp nhận xét được cá nhân hóa một cách nhanh chóng.
          </p>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '32px' }}>
            Tối ưu hóa việc lưu trữ và theo dõi thông tin học viên.
            Hệ thống cho phép bạn dễ dàng thêm mới, chỉnh sửa thông tin cá nhân và phân loại sinh viên theo lớp học.
          </p>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '32px' }}>
            Linh hoạt trong việc thiết kế và quản lý kho đề bài.
            Bạn có thể thiết lập các câu hỏi kèm theo tiêu chí chấm điểm (Rubric) riêng biệt,
            giúp định hướng cho AI phân tích bài làm một cách chính xác và bám sát yêu cầu chuyên môn của từng bộ môn
          </p>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '32px' }}>
            Tại đây, giảng viên có thể theo dõi toàn bộ tiến độ nộp bài, kiểm soát trạng thái chấm điểm,
            và thực hiện các thao tác chấm bài hàng loạt bằng AI, mang lại quy trình làm việc liền mạch và hiệu quả cao.
          </p>
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            gap: "12px",
            alignItems: "flex-start"
          }}>
            <p>🤖 Gemini AI</p>
            <p>📄 PDF Upload</p>
            <p>🛡️ Anti-Plagiarism</p>
            <p>📊 Dashboard</p>
            <p>👨‍🎓 Students Management</p>
            <p>📥 Submissions Management</p>
            <p>📝 Question Management</p>
          </div>

          <button 
            onClick={onStart}
            className="auth-button" 
            style={{ width: 'fit-content', padding: '12px 40px', fontSize: '1.1rem', marginTop: "32px" }}
          >
            Get Started ➔
          </button>
        </div>

        {/* Bên phải: Hình ảnh */}
        <div style={{
            flex: '1 1 450px',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            marginTop: '85px'
        }}>
          <img 
            src="/src/assets/AI_Concept_1.jpg" 
            alt="AI Concept 1" 
            style={{ 
              width: '100%', 
              borderRadius: '24px',
              border: '1px solid var(--border)'
            }} 
          />
          <img 
            src="/src/assets/AI_Concept_2.png" 
            alt="AI Concept 2" 
            style={{ 
              width: '100%', 
              borderRadius: '24px',
              //boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              border: '1px solid var(--border)'
            }} 
          />
        </div>
      </div>
    </div>
  );
}