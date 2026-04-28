import { useState, useEffect, useCallback, useRef } from "react";
import { getSubmissions } from "../api/client";
import type { Submission } from "../types";
import FileUpload from "./FileUpload";
import GradeActions from "./GradeActions";
import SubmissionsTable from "./SubmissionsTable";
import StudentManagement from "./StudentManagement";
import QuestionManagement from "./QuestionManagement";
import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [ungradedCount, setUngradedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"submissions" | "students" | "questions">("submissions");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await getSubmissions();
      setSubmissions(data.submissions);
      setUngradedCount(data.ungraded_count);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleProfileClick = () => {
    // TODO: Navigate to profile page or open profile modal
    alert('Profile page coming soon!');
    setShowProfileMenu(false);
  };

  const handleChangePasswordClick = () => {
    setShowChangePasswordModal(true);
    setShowProfileMenu(false);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
      <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>
            Tutor Feedback Engine
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Upload student PDFs, detect plagiarism, and generate AI-powered feedback
          </p>
        </div>
        
        {/* User Profile Dropdown */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 16px",
              backgroundColor: "#1e1e2f",
              border: "1px solid #2d2d44",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#ffffff",
              transition: "all 0.2s ease"
            }}
          >
            {/* User Avatar */}
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              fontWeight: 600
            }}>
              {user?.full_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {/* User Name */}
            <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {user?.full_name || user?.username || 'User'}
            </span>
            
            {/* Dropdown Arrow */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{
              transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              backgroundColor: "#1e1e2f",
              border: "1px solid #2d2d44",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              minWidth: "180px",
              zIndex: 1000,
              overflow: "hidden"
            }}>
              {/* User Info Header */}
              <div style={{
                padding: "12px 16px",
                borderBottom: "1px solid #2d2d44"
              }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#ffffff" }}>
                  {user?.full_name || user?.username}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                  {user?.email}
                </div>
              </div>
              
              {/* Menu Items */}
              <button
                onClick={handleChangePasswordClick}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderTop: "1px solid #2d2d44",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2d2d44"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <span>🔑</span>
                <span>Change Password</span>
              </button>
              
              <button
                onClick={onLogout}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderTop: "1px solid #2d2d44",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <span>🚪</span>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{
        display: "flex", 
        gap: "4px", 
        marginBottom: "24px", 
        backgroundColor: "#1e1e2f", // Màu nền nhẹ cho thanh nav
        padding: "4px", 
        borderRadius: "8px",
        width: "fit-content"
      }}>
        {[
          { id: "submissions", label: "📄 Submissions" },
          { id: "students", label: "👨‍🎓 Students" },
          { id: "questions", label: "❓ Questions" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "submissions" | "students" | "questions")}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: activeTab === tab.id ? 600 : 500,
              backgroundColor: activeTab === tab.id ? "#3b82f6" : "transparent",
              color: activeTab === tab.id ? "#ffffff" : "#94a3b8",
              transition: "all 0.2s ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "submissions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <FileUpload onUploadComplete={fetchData} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
            }}
          >
            <GradeActions ungradedCount={ungradedCount} onGradeComplete={fetchData} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""} total
            </span>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                border: "1px solid var(--danger)",
                borderRadius: "var(--radius)",
                color: "var(--danger)",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
              Loading submissions...
            </div>
          ) : (
            <SubmissionsTable submissions={submissions} onGradeComplete={fetchData} />
          )}
        </div>
      )}

      {activeTab === "students" && <StudentManagement />}

      {activeTab === "questions" && <QuestionManagement />}
      
      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
    </div>
  );
}
