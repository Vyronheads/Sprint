import { useState } from 'react';

export interface AuthUser {
  username: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (username: string, _password: string) => {
    setUser({ username });
  };

  const logout = () => {
    setUser(null);
  };

  return { user, login, logout };
};

export default useAuth;