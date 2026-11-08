import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Eye, EyeOff, Lock, User, Triangle } from 'lucide-react';

export interface LoginFormProps {
  onLogin: (user: string, password: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(user, password);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Triangle className="h-7 w-7" strokeWidth={2.4} />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">PixelForge</h1>
          <p className="text-sm text-muted-foreground">
            Ferramenta da equipe para desenvolvimento de jogos
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Use suas credenciais para acessar o estúdio</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="user" className="text-foreground">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="user"
                    type="text"
                    placeholder="seu usuário"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" size="lg" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Entrar no estúdio
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Acesso restrito à equipe de desenvolvimento
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
