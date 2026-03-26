import React, { createContext, useContext, useMemo, useState } from "react";

const EmpresaContext = createContext(null);

export function EmpresaProvider({ children }) {
  const [empresa, setEmpresa] = useState(null); // {id, nome...}
  const value = useMemo(() => ({ empresa, setEmpresa }), [empresa]);
  return <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>;
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresa must be used within EmpresaProvider");
  return ctx;
}
