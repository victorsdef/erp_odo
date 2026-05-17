import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSystemConfig } from '../services/configService';

const SystemConfigContext = createContext({ config: { nombre: 'ODO Clinic', logoArchivo: null }, setConfig: () => {} });

export function SystemConfigProvider({ children }) {
  const [config, setConfig] = useState({ nombre: 'ODO Clinic', logoArchivo: null });

  useEffect(() => {
    getSystemConfig().then(setConfig).catch(() => {});
  }, []);

  return (
    <SystemConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfig() {
  return useContext(SystemConfigContext);
}
