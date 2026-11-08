import { createFileRoute } from '@tanstack/react-router';
import SprintManager from '@/components/SprintManager';

export const Route = createFileRoute('/Sprints')({
  head: () => ({
    meta: [{ title: 'Sprints — PixelForge' }],
  }),
  component: SprintsRoute,
});

function SprintsRoute() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Gerenciamento de Sprints</h1>
      <SprintManager />
    </div>
  );
}

export default SprintsRoute;