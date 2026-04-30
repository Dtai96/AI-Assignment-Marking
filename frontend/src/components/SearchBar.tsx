import { SearchIcon } from './Icons';

interface SearchBarProps {
  placeholder: string;
  onSearch: (value: string) => void;
}

export default function SearchBar({ placeholder, onSearch }: SearchBarProps) {
  return (
    <div style={{ marginBottom: "20px", position: "relative", maxWidth: "460px" }}>
      <span style={{ 
        position: "absolute", left: "12px", top: "50%", 
        transform: "translateY(-50%)", color: "var(--text-muted)" 
      }}>
        <SearchIcon size={18} />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 12px 12px 40px",
          backgroundColor: "var(--bg-input)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          color: "var(--text-primary)",
          fontSize: "1rem",
          outline: "none",
          transition: "all 0.2s"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.boxShadow = "0 0 0 3px var(--accent-light)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}