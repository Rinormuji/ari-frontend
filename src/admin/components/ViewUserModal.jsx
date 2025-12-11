import React from "react";
import "../admin.css";

const ViewUserModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>Detajet e Përdoruesit</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">

          <div className="modal-user-left">
            <div className="modal-avatar">
              {user.name?.charAt(0)}
            </div>
            <h3 className="user-name">{user.name}</h3>
            <p className="user-email">{user.email}</p>
          </div>

          <div className="modal-user-right">

            <div className="info-row">
              <span className="label">Roli:</span>
              <span className="value">{user.role}</span>
            </div>

            <div className="info-row">
              <span className="label">Statusi:</span>
              <span className={`value status ${user.status}`}>
                {user.status === "ACTIVE" ? "Aktiv" : "I Bllokuar"}
              </span>
            </div>

            <div className="info-row">
              <span className="label">Data e krijimit:</span>
              <span className="value">{user.createdAt}</span>
            </div>

            <div className="info-row">
              <span className="label">ID:</span>
              <span className="value">{user.id}</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
