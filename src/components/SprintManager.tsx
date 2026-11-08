import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Sprint {
  id: string;
  name: string;
  description: string;
  sharedWith: string[];
}

const SprintManager: React.FC = () => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [newSprint, setNewSprint] = useState({ name: '', description: '' });
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [sharedUsers, setSharedUsers] = useState<string>('');

  const handleCreateSprint = () => {
    if (!newSprint.name.trim()) {
      toast('Informe um nome', { description: 'O campo nome é obrigatório para criar a sprint.' });
      return;
    }
    const newSprintItem: Sprint = {
      id: Date.now().toString(),
      name: newSprint.name.trim(),
      description: newSprint.description.trim(),
      sharedWith: [],
    };
    setSprints([...sprints, newSprintItem]);
    setNewSprint({ name: '', description: '' });
    toast('Sprint criada', { description: `Sprint "${newSprintItem.name}" foi criada com sucesso.` });
  };

  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setNewSprint({ name: sprint.name, description: sprint.description });
  };

  const handleUpdateSprint = () => {
    if (!editingSprint) return;
    if (!newSprint.name.trim()) {
      toast('Informe um nome', { description: 'O campo nome é obrigatório para atualizar a sprint.' });
      return;
    }
    setSprints((prev) =>
      prev.map((sprint) =>
        sprint.id === editingSprint.id
          ? { ...sprint, name: newSprint.name.trim(), description: newSprint.description.trim() }
          : sprint
      )
    );
    setEditingSprint(null);
    setNewSprint({ name: '', description: '' });
    toast('Sprint atualizada', { description: `Sprint "${newSprint.name.trim()}" foi atualizada com sucesso.` });
  };

  const handleShareSprint = (sprintId: string) => {
    const users = sharedUsers.split(',').map((u) => u.trim()).filter(Boolean);
    if (users.length === 0) {
      toast('Informe usuários', { description: 'Separe os nomes de usuário por vírgula para compartilhar.' });
      return;
    }
    setSprints((prev) =>
      prev.map((sprint) =>
        sprint.id === sprintId
          ? { ...sprint, sharedWith: [...new Set([...sprint.sharedWith, ...users])] }
          : sprint
      )
    );
    setSharedUsers('');
    toast('Sprint compartilhada', { description: `Agora compartilhada com: ${users.join(', ')}.` });
  };

  const handleRemoveCollaborator = (sprintId: string, user: string) => {
    setSprints((prev) =>
      prev.map((sprint) =>
        sprint.id === sprintId
          ? { ...sprint, sharedWith: sprint.sharedWith.filter((u) => u !== user) }
          : sprint
      )
    );
    toast('Colaborador removido', { description: `${user} não tem mais acesso à sprint.` });
  };

  const handleCancelEdit = () => {
    setEditingSprint(null);
    setNewSprint({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>{editingSprint ? 'Editar Sprint' : 'Criar Nova Sprint'}</CardTitle>
          <CardDescription>
            {editingSprint
              ? 'Altere o nome ou a descrição da sprint selecionada.'
              : 'Preencha as informações abaixo para criar uma nova sprint.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nome da Sprint</label>
              <Input
                placeholder="Ex.: Sprint de Lançamento"
                value={newSprint.name}
                onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                placeholder="Descreva o objetivo e escopo desta sprint…"
                value={newSprint.description}
                onChange={(e) => setNewSprint({ ...newSprint, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={editingSprint ? handleUpdateSprint : handleCreateSprint}>
                {editingSprint ? 'Salvar Alterações' : 'Criar Sprint'}
              </Button>
              {editingSprint && (
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {sprints.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhuma sprint criada ainda. Crie a primeira sprint no formulário acima.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <Card key={sprint.id} className={editingSprint?.id === sprint.id ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{sprint.name}</CardTitle>
                  {sprint.sharedWith.length > 0 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {sprint.sharedWith.length} colaborador{sprint.sharedWith.length > 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {sprint.description || 'Sem descrição.'}
                </p>

                {sprint.sharedWith.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Colaboradores</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {sprint.sharedWith.map((user) => (
                        <li key={user} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs">
                          {user}
                          <button
                            onClick={() => handleRemoveCollaborator(sprint.id, user)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Remover ${user}`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Compartilhar com outros usuários
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="usuário1, usuário2…"
                      value={sharedUsers}
                      onChange={(e) => setSharedUsers(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleShareSprint(sprint.id);
                      }}
                    />
                    <Button variant="secondary" onClick={() => handleShareSprint(sprint.id)} size="sm">
                      Adicionar
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleEditSprint(sprint)}
                >
                  Editar Sprint
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SprintManager;