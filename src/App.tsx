import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import SprintManager from '@/components/SprintManager';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/useAuth';

const App: React.FC = () => {
  const { user, login, logout } = useAuth();

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginForm onLogin={(u) => login(u, '')} />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Gerenciamento de Sprints</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Olá, <strong className="text-foreground">{user.username}</strong>
              </span>
              <button
                onClick={logout}
                className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Sair
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-6">
          <SprintManager />
        </main>
      </div>
    </>
  );
};

export default App;