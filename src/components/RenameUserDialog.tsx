import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { User } from "@/components/UserBoard";

type Props = {
  user: User;
  onSave: (userId: string, name: string) => void;
  onClose: () => void;
};

export default function RenameUserDialog({ user, onSave, onClose }: Props) {
  const [newName, setNewName] = useState(user.name);
  const save = () => {
    if (!newName.trim()) return;
    onSave(user.id, newName.trim());
    toast.success(`Nome alterado para ${newName.trim()}`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar nome</DialogTitle>
          <DialogDescription>Como você quer chamar {user.name} agora?</DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save(); } }}
          placeholder="Novo nome"
          className="mt-2"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!newName.trim()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}