import { createContext, useContext, type ReactNode } from 'react';
import type { ServiceContainer } from '@/services/container';
import { getServiceContainer } from '@/services/container';

const ServiceContext = createContext<ServiceContainer>(getServiceContainer());

export function ServiceProvider({
  services,
  children,
}: {
  services?: ServiceContainer;
  children: ReactNode;
}) {
  const value = services ?? getServiceContainer();
  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServiceContainer(): ServiceContainer {
  return useContext(ServiceContext);
}
