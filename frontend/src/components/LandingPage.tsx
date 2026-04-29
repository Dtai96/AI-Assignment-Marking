import { GraduationCapIcon } from './Icons';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1100px',
        display: 'flex',
        alignItems: 'center',
        gap: '60px',
        flexWrap: 'wrap-reverse'
      }}>
        {/* Bên trái: Giới thiệu */}
        <div style={{ flex: '1 1 450px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <GraduationCapIcon size={48} color="var(--accent)" />
            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>AI Assignment Marking</h1>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Automated scoring using AI.
          </h2>
          
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '32px' }}>
            Tutor Feedback Engine giúp giảng viên chấm điểm bài làm PDF của sinh viên một cách nhanh chóng. 
            Sử dụng Gemini AI để phân tích nội dung, phát hiện đạo văn và cung cấp nhận xét cá nhân hóa chỉ trong vài giây.
          </p>

          <button 
            onClick={onStart}
            className="auth-button" 
            style={{ width: 'fit-content', padding: '12px 40px', fontSize: '1.1rem' }}
          >
            Get Started ➔
          </button>
        </div>

        {/* Bên phải: Hình ảnh */}
        <div style={{ flex: '1 1 450px', textAlign: 'center' }}>
          <img 
            src="https://img.freepik.com/free-vector/artificial-intelligence-concept-illustration_114360-7004.jpg" 
            alt="AI Concept" 
            style={{ 
              width: '100%', 
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              border: '1px solid var(--border)'
            }} 
          />
        </div>
      </div>
    </div>
  );
}