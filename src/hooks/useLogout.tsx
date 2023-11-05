import React, { useCallback } from 'react';

export default function useLogout() {
  const handleLogged = useCallback(async function () {
    localStorage.removeItem('@token');
    window.location.reload();
  }, []);

  return { handleLogged };
}
