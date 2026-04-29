interface SearchBarProps {
  placeholder: string;
  onSearch: (value: string) => void;
}

export default function SearchBar({ placeholder, onSearch }: SearchBarProps) {
  return (
    <div style={{ marginBottom: "20px", position: "relative", maxWidth: "400px" }}>
      <span style={{ 
        position: "absolute", left: "12px", top: "50%", 
        transform: "translateY(-50%)", color: "#64748b" 
      }}>
        🔍
      </span>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 10px 10px 40px",
          backgroundColor: "#1e1e2f",
          border: "1px solid #334155",
          borderRadius: "8px",
          color: "white",
          fontSize: "0.9rem",
          outline: "none",
          transition: "border-color 0.2s"
        }}
        onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
        onBlur={(e) => e.target.style.borderColor = "#334155"}
      />
    </div>
  );
}