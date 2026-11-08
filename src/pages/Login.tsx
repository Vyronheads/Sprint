import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/LoginForm';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();

  const handleLogin = (username: string, password: string) => {
    onLogin(username, password);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}