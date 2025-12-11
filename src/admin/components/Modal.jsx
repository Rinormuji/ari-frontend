import React from "react";
import "../admin.css";

function Modal({ isOpen, onClose, title, children, width = "500px" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: width }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
