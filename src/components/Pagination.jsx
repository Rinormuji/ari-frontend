// Pagination.jsx
import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination-container" style={styles.container}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={styles.button}
      >
        &laquo; Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            ...styles.pageBtn,
            ...(p === currentPage ? styles.active : {}),
          }}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={styles.button}
      >
        Next &raquo;
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    flexWrap: "wrap",
  },
  button: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
  pageBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
  active: {
    background: "#111",
    color: "#fff",
    borderColor: "#111",
    fontWeight: 700,
  },
};