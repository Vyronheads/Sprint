import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '@/components/LoginForm';
import { toast } from 'sonner';

export const Route = createFileRoute('/Login')({
  head: () => ({
    meta: [
      { title: 'Login — PixelForge' },
      {
        name: 'description',
        content: 'Acesse a ferramenta de desenvolvimento de jogos da equipe.',
      },
      { property: 'og:title', content: 'Login — PixelForge' },
      {
        property: 'og:description',
        content: 'Acesse a ferramenta de desenvolvimento de jogos da equipe.',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const navigate = useNavigate();

  const handleLogin = (user: string, password: string) => {
    if (user.trim() && password.trim()) {
      localStorage.setItem('pixelforge-session', user);
      toast('Login realizado', { description: `Bem-vindo(a), ${user}!` });
      navigate('/sprints');
    } else {
      toast('Login falhou', { description: 'Informe usuário e senha.' });
    }
  };

  return <LoginForm onLogin={handleLogin} />;
}

export default LoginRoute;
