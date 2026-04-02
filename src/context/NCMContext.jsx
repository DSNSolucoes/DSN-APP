import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { obterNCM } from '../api/comboService';

const NCMContext = createContext(null);

export function NCMProvider({ children }) {
  const [ncms, setNcms] = useState([]);
  const [ncmSelecionado, setNcmSelecionado] = useState(null);

  useEffect(() => {
    obterNCM()
      .then((lista) => {
        const arr = lista || [];
        setNcms(arr);
        // seleciona o padrão automático (campo Padrao == 'V')
        const padrao = arr.find((n) => n.padrao === 'V' || n.Padrao === 'V');
        if (padrao) setNcmSelecionado(padrao);
        else if (arr.length > 0) setNcmSelecionado(arr[0]);
      })
      .catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ ncms, ncmSelecionado, setNcmSelecionado }),
    [ncms, ncmSelecionado]
  );

  return <NCMContext.Provider value={value}>{children}</NCMContext.Provider>;
}

export function useNCM() {
  const ctx = useContext(NCMContext);
  if (!ctx) throw new Error('useNCM deve ser usado dentro de <NCMProvider />');
  return ctx;
}
