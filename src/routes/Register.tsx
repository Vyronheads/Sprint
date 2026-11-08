import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface UserRecord {
  username: string;
  email: string;
  password: string;
}

const USERS_KEY = 'pixelforge-users';

async function saveUser(user: UserRecord): Promise<void> {
  const raw = localStorage.getItem(USERS_KEY);
  const users: UserRecord[] = raw ? JSON.parse(raw) : [];
  if (users.some((u) => u.username === user.username)) {
    throw new Error('username_exists');
  }
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const data = new FormData(form);
    const username = (data.get('username') as string).trim();
    const email = (data.get('email') as string).trim();
    const password = data.get('password') as string;

    if (!username || !email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    try {
      await saveUser({ username, email, password });
      navigate('/login');
    } catch {
      setError('Usuário já existe ou erro ao cadastrar.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cadastro</CardTitle>
          <CardDescription>Crie sua conta na equipe</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium">
                Nome de Usuário
              </label>
              <Input id="username" name="username" type="text" required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Cadastrar</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;