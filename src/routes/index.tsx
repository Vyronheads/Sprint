import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, NotebookPen, Plus, Trash2 } from "lucide-react";
import { UserBoard, USERS, UserStatus, type User } from "@/components/UserBoard";
import { MorphingTextPopover } from "@/components/MorphingTextPopover";
import FluxLines from "@/components/FluxLines";
import AnimatedContent from "@/components/AnimatedContent";
import HoldButton from "@/components/HoldButton";
import { GlassColumnHeader } from "@/components/GlassColumnHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sprints & Notas — Quadro de trabalho" },
      { name: "description", content: "Organize sprints, tarefas e anotações em um só lugar." },
      { property: "og:title", content: "Sprints & Notas" },
      {
        property: "og:description",
        content: "Organize sprints, tarefas e anotações em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Status = "todo" | "doing" | "done";
type Task = { id: string; title: string; status: Status };
type Sprint = { id: string; name: string; goal: string; tasks: Task[]; notes: string };

const COLS: { key: Status; label: string; dot: string }[] = [
  { key: "todo", label: "A fazer", dot: "#73778B" },
  { key: "doing", label: "Em andamento", dot: "#7873AD" },
  { key: "done", label: "Concluído", dot: "#D8D9E2" },
];
const uid = () => Math.random().toString(36).slice(2, 10);
const KEY = "sprints-v1";
/** Lets the "done" state of a hold-to-delete button show before the item disappears. */
const DELETE_DELAY = 550;

const HOLD_STYLE = {
  backgroundColor: "#27272a",
  fillColor: "#5227FF",
  textColor: "#f5f5f5",
  fillTextColor: "#ffffff",
  fillDirection: "right",
  releaseTime: 200,
  pressScale: 0.97,
  wave: true,
  glow: true,
  resetAfter: 1200,
} as const;

function Index() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>(USERS);
  const [userStatus, setUserStatus] = useState<Record<string, UserStatus>>(() =>
    Object.fromEntries(USERS.map((u) => [u.id, "idle" as UserStatus])),
  );

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    const data: Sprint[] = raw
      ? JSON.parse(raw)
      : [{ id: uid(), name: "Sprint 1", goal: "", tasks: [], notes: "" }];
    setSprints(data);
    setActiveId(data[0]?.id ?? null);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(sprints));
  }, [sprints, loaded]);

  const active = sprints.find((s) => s.id === activeId);
  const update = (patch: Partial<Sprint>) =>
    setSprints((ss) => ss.map((s) => (s.id === activeId ? { ...s, ...patch } : s)));
  const updateTasks = (fn: (tasks: Task[]) => Task[]) =>
    setSprints((ss) => ss.map((s) => (s.id === activeId ? { ...s, tasks: fn(s.tasks) } : s)));

  const addSprint = (name: string) => {
    const s: Sprint = {
      id: uid(),
      name: name.trim() || `Sprint ${sprints.length + 1}`,
      goal: "",
      tasks: [],
      notes: "",
    };
    setSprints((ss) => [...ss, s]);
    setActiveId(s.id);
  };
  const removeSprint = (id: string) => setSprints((ss) => ss.filter((s) => s.id !== id));
  // When the active sprint disappears, fall back to the first remaining one.
  useEffect(() => {
    if (loaded && activeId && !sprints.some((s) => s.id === activeId))
      setActiveId(sprints[0]?.id ?? null);
  }, [sprints, activeId, loaded]);

  const done = active ? active.tasks.filter((t) => t.status === "done").length : 0;
  const pct = active && active.tasks.length ? Math.round((done / active.tasks.length) * 100) : 0;

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0">
        <FluxLines
          colors={["#ffffff", "#ffffff", "#ffffff"]}
          glow={2}
          rimWidth={0.2}
          lineWidth={1}
          flowDirection="down"
          mouseInteraction
          clickSwirl
          speed={0.5}
          scale={1.6}
          turbulence={1}
          fluidity={0.1}
          sharpness={2.5}
          shimmer={1.5}
          mouseStrength={1}
          mouseRadius={0.35}
          intro
          lightMode={false}
          opacity={0.3}
        />
      </div>

      <div className="relative z-10 md:flex">
        <aside className="glass m-3 rounded-2xl p-5 md:sticky md:top-3 md:w-64 md:self-start">
          <AnimatedContent distance={24} duration={0.7} stagger={0.08} threshold={0}>
            <div>
              <p className="text-[10px] font-medium tracking-[0.18em] text-[#73778B] uppercase">
                Quadro
              </p>
              <h1 className="mt-1 font-display text-2xl font-medium tracking-[-0.035em]">
                Sprints
              </h1>
            </div>
            <ul className="mt-5 space-y-1">
              {sprints.map((s) => (
                <li key={s.id} className="flex animate-pop-in items-center">
                  <button
                    onClick={() => setActiveId(s.id)}
                    aria-current={s.id === activeId ? "page" : undefined}
                    className={`flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                      s.id === activeId
                        ? "bg-white/[0.08] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-[#A7A9BB] hover:bg-white/[0.04] hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    <span className="ml-2 text-xs text-[#73778B] tabular-nums">
                      {s.tasks.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <MorphingTextPopover
              className="mt-4 w-full"
              triggerWrapperClassName="w-full"
              triggerClassName="border border-dashed border-white/15 bg-white/[0.02] text-[#A7A9BB] transition-colors hover:border-white/30 hover:text-foreground"
              contentClassName="left-0 top-0 w-full"
              icon={<Plus className="h-4 w-4" />}
              label="Nova sprint"
              placeholder="Nome da sprint…"
              submitLabel="Criar"
              submitOnEnter
              fieldHeight={92}
              onSubmit={(name) => addSprint(name)}
            />
          </AnimatedContent>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          {!active ? (
            <p className="text-muted-foreground">{loaded ? "Crie uma sprint para começar." : ""}</p>
          ) : (
            <AnimatedContent
              key={active.id}
              className="mx-auto max-w-6xl space-y-10"
              distance={100}
              direction="vertical"
              duration={0.8}
              ease="power3.out"
              blur={0}
              stagger={0.08}
              threshold={0.1}
            >
              <header className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] text-[#A7A9BB] uppercase">
                      <span className="h-1 w-1 rounded-full bg-[#7873AD]" />
                      Sprint ativa
                    </span>
                    <input
                      value={active.name}
                      onChange={(e) => update({ name: e.target.value })}
                      aria-label="Nome da sprint"
                      className="w-full bg-transparent font-display text-4xl leading-[1.1] font-medium tracking-[-0.045em] outline-none md:text-5xl"
                    />
                    <input
                      value={active.goal}
                      onChange={(e) => update({ goal: e.target.value })}
                      placeholder="Objetivo da sprint…"
                      aria-label="Objetivo da sprint"
                      className="w-full bg-transparent text-[15px] text-[#A7A9BB] outline-none placeholder:text-[#73778B]"
                    />
                  </div>
                  <HoldButton
                    {...HOLD_STYLE}
                    size="md"
                    radius={14}
                    holdTime={2000}
                    waveAmplitude={6}
                    doneLabel="Excluída"
                    aria-label={`Segure para excluir a sprint ${active.name}`}
                    onHold={() => {
                      const id = active.id;
                      setTimeout(() => removeSprint(id), DELETE_DELAY);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Segure para excluir
                  </HoldButton>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4A4E79] via-[#7873AD] to-[#D8D9E2] transition-[width] duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm text-[#A7A9BB] tabular-nums">
                    {pct}%
                  </span>
                </div>
              </header>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-medium tracking-[-0.035em]">Tarefas</h2>
                  <MorphingTextPopover
                    className="justify-end"
                    triggerClassName="bg-[#F5F5F7] text-[#0B0C0F] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-colors hover:bg-white"
                    contentClassName="right-0 top-0 w-[min(364px,calc(100vw-3rem))]"
                    icon={<Plus className="h-4 w-4" />}
                    label="Adicionar"
                    placeholder="Nova tarefa…"
                    submitLabel="Adicionar"
                    submitOnEnter
                    fieldHeight={120}
                    onSubmit={(title) => {
                      const t = title.trim();
                      if (!t) return false;
                      updateTasks((ts) => [...ts, { id: uid(), title: t, status: "todo" }]);
                      return true;
                    }}
                  />
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                  {COLS.map((c) => {
                    const items = active.tasks.filter((t) => t.status === c.key);
                    return (
                      <section
                        key={c.key}
                        aria-label={c.label}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const id = e.dataTransfer.getData("text");
                          updateTasks((ts) =>
                            ts.map((t) => (t.id === id ? { ...t, status: c.key } : t)),
                          );
                        }}
                        className="glass min-h-48 rounded-2xl p-3"
                      >
                        <GlassColumnHeader label={c.label} count={items.length} dot={c.dot} />
                        <div className="space-y-2">
                          {items.length === 0 && (
                            <p className="rounded-xl border border-dashed border-white/[0.07] px-3 py-6 text-center text-xs text-[#73778B]">
                              Arraste tarefas para cá
                            </p>
                          )}
                          {items.map((t) => (
                            <div
                              key={t.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("text", t.id)}
                              className="glass-item group flex animate-pop-in cursor-grab items-center gap-2 rounded-xl p-3 text-sm"
                            >
                              <span
                                className={`flex-1 ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}
                              >
                                {t.title}
                              </span>
                              <select
                                value={t.status}
                                aria-label={`Status de ${t.title}`}
                                onChange={(e) =>
                                  updateTasks((ts) =>
                                    ts.map((x) =>
                                      x.id === t.id
                                        ? { ...x, status: e.target.value as Status }
                                        : x,
                                    ),
                                  )
                                }
                                className="bg-transparent text-xs text-muted-foreground outline-none [&>option]:bg-[#181A20]"
                              >
                                {COLS.map((o) => (
                                  <option key={o.key} value={o.key}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                              <HoldButton
                                {...HOLD_STYLE}
                                size="sm"
                                radius={9}
                                holdTime={1000}
                                waveAmplitude={3}
                                className="h-7 w-7 px-0"
                                doneLabel={<Check className="h-3.5 w-3.5" />}
                                aria-label={`Segure para excluir a tarefa ${t.title}`}
                                title="Segure para excluir"
                                onHold={() =>
                                  setTimeout(
                                    () => updateTasks((ts) => ts.filter((x) => x.id !== t.id)),
                                    DELETE_DELAY,
                                  )
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </HoldButton>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="mb-4 font-display text-2xl font-medium tracking-[-0.035em]">
                  Equipe
                </h2>
                <UserBoard
                  users={users}
                  status={userStatus}
                  onStatusChange={(id, st) => setUserStatus((m) => ({ ...m, [id]: st }))}
                  onRename={(id, name) =>
                    setUsers((us) => us.map((u) => (u.id === id ? { ...u, name } : u)))
                  }
                />
              </section>

              <section className="pb-10">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl font-medium tracking-[-0.035em]">
                    Anotações
                  </h2>
                  <MorphingTextPopover
                    className="justify-end"
                    triggerClassName="border border-white/10 bg-white/[0.04] text-foreground backdrop-blur-md transition-colors hover:bg-white/[0.08]"
                    contentClassName="right-0 top-0 w-[min(560px,calc(100vw-3rem))]"
                    icon={<NotebookPen className="h-4 w-4" />}
                    label="Editar notas"
                    placeholder="Reuniões, decisões, ideias, retrospectiva…"
                    submitLabel="Salvar"
                    fieldHeight={260}
                    initialValue={active.notes}
                    onSubmit={(notes) => update({ notes })}
                  />
                </div>
                <div className="glass min-h-40 rounded-2xl p-5">
                  {active.notes.trim() ? (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-[#D8D9E2]">
                      {active.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-[#73778B]">
                      Nenhuma anotação ainda. Use{" "}
                      <span className="text-[#A7A9BB]">Editar notas</span> para registrar reuniões,
                      decisões e ideias.
                    </p>
                  )}
                </div>
              </section>
            </AnimatedContent>
          )}
        </main>
      </div>
    </div>
  );
}
