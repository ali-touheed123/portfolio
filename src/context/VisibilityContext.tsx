import React, { createContext, useContext } from 'react';

const HomeVisibilityContext = createContext<boolean>(true);

export const HomeVisibilityProvider = HomeVisibilityContext.Provider;

export function useHomeVisible(): boolean {
  return useContext(HomeVisibilityContext);
}
