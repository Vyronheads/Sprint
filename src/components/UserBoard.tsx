import { lazy, Suspense, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { GlassColumnHeader } from "@/components/GlassColumnHeader";

const RenameUserDialog = lazy(() => import("@/components/RenameUserDialog"));

export type UserStatus = "idle" | "todo" | "doing" | "done";
export type User = { id: string; name: string; color: string };

export const USERS: User[] = [
  { id: "u1", name: "Ana", color: "#6366f1" },
  { id: "u2", name: "Bruno", color: "#10b981" },
  { id: "u3", name: "Carla", color: "#f59e0b" },
  { id: "u4", name: "Diego", color: "#ec4899" },
];

type Props = {
  users: User[];
  status: Record<string, UserStatus>;
  onStatusChange: (userId: string, status: UserStatus) => void;
  onRename?: (userId: string, newName: string) => void;
};

const COLS: { key: UserStatus; label: string; dot: string }[] = [
  { key: "idle", label: "Disponível", dot: "#8B91A8" },
  { key: "todo", label: "Planejando", dot: "#73778B" },
  { key: "doing", label: "Trabalhando", dot: "#7873AD" },
  { key: "done", label: "Concluído", dot: "#D8D9E2" },
];

export function UserBoard({ users, status, onStatusChange, onRename }: Props) {
  const [ghost, setGhost] = useState<{
    id: string;
    name: string;
    color: string;
    x: number;
    y: number;
  } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const dragStart = useRef<{ userId: string; startX: number; startY: number } | null>(null);

  const start = (e: React.PointerEvent, u: User) => {
    dragStart.current = { userId: u.id, startX: e.clientX, startY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent, u: User) => {
    if (!dragStart.current || dragStart.current.userId !== u.id) return;
    if (
      ghost == null &&
      Math.hypot(e.clientX - dragStart.current.startX, e.clientY - dragStart.current.startY) < 4
    )
      return;
    setGhost({ id: u.id, name: u.name, color: u.color, x: e.clientX, y: e.clientY });
  };

  const openRename = (user: User) => {
    setEditingUser(user);
  };

  const end = (e: React.PointerEvent, u: User) => {
    if (dragStart.current?.userId === u.id && ghost) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const colEl = el?.closest("[data-col]") as HTMLElement | null;
      const col = colEl?.dataset?.["col"] as UserStatus | undefined;
      if (col && col !== status[u.id]) onStatusChange(u.id, col);
    }
    dragStart.current = null;
    setGhost(null);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {COLS.map((c) => (
          <div key={c.key} data-col={c.key} className="glass min-h-44 rounded-2xl p-3">
            <GlassColumnHeader
              label={c.label}
              count={users.filter((u) => status[u.id] === c.key).length}
              dot={c.dot}
            />
            <div className="space-y-2">
              {users
                .filter((u) => status[u.id] === c.key)
                .map((u) => (
                  <div
                    key={u.id}
                    onPointerDown={(e) => start(e, u)}
                    onPointerMove={(e) => move(e, u)}
                    onPointerUp={(e) => end(e, u)}
                    onPointerCancel={(e) => end(e, u)}
                    className="glass-item flex cursor-grab items-center gap-2 rounded-xl p-3 text-sm select-none touch-none"
                  >
                    <span className="h-3 w-3 rounded-full" style={{ background: u.color }} />
                    <span className="flex-1 font-medium">{u.name}</span>
                    <button
                      type="button"
                      onClick={() => openRename(u)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      aria-label={`Alterar nome de ${u.name}`}
                      title="Alterar nome"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {ghost && (
        <div
          className="glass-panel pointer-events-none fixed z-50 flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
          style={{ left: ghost.x + 8, top: ghost.y + 8 }}
        >
          <span className="h-3 w-3 rounded-full" style={{ background: ghost.color }} />
          <span className="font-medium">{ghost.name}</span>
        </div>
      )}

      {editingUser && (
        <Suspense fallback={null}>
          <RenameUserDialog
            user={editingUser}
            onSave={(id, name) => onRename?.(id, name)}
            onClose={() => setEditingUser(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
