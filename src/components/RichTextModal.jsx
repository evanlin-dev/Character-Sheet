import { useState } from "react";
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn } from "src/styles/shared";

export default function RichTextModal({ title, value, onChange, onClose }) {
  const [isEditing, setIsEditing] = useState(false);

  const formatText = (text) => {
    if (!text) return "<em style='color:var(--ink-light)'>No description available...</em>";
    // Convert **bold** to <b>bold</b> and \n to <br> for HTML rendering
    return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()} $maxWidth="500px">
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle>{title}</ModalTitle>
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsEditing(!isEditing)}
              style={{ fontSize: "0.8rem", padding: "4px 10px" }}
            >
              {isEditing ? "View Rendered" : "Edit Text"}
            </button>
          </div>
          {isEditing ? (
            <textarea
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: "100%",
                minHeight: "250px",
                padding: "10px",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                border: "1px solid var(--gold)",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.7)",
                resize: "vertical"
              }}
              placeholder="Enter description..."
              autoFocus
            />
          ) : (
            <div
              className="rendered-desc"
              style={{
                width: "100%",
                minHeight: "250px",
                padding: "10px",
                fontSize: "0.9rem",
                border: "1px solid var(--gold)",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.5)",
                overflowY: "auto",
                lineHeight: "1.5"
              }}
              dangerouslySetInnerHTML={{
                __html: formatText(value)
              }}
            />
          )}
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}