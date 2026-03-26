// src/components/EmptyState.jsx
import React from 'react';

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">⚠️</div>
      <h2>{title}</h2>
      <p>{description}</p>
      {onAction && (
        <button className="primary-button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
