import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { loadingService } from "../../services/loadingService";
import "./LoadingOverlay.css";

export function LoadingOverlay() {
  const [pending, setPending] = useState(0);

  useEffect(() => loadingService.subscribe(setPending), []);

  if (pending <= 0) return null;

  return createPortal(
    <div className="lo-backdrop" aria-live="polite" aria-busy="true">
      <div className="lo-spinner" aria-label="Carregando" />
    </div>,
    document.body
  );
}