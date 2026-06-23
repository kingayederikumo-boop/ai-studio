export default function WorkspacePage() {
  return (
    <main className="h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 p-4">
        <h1 className="text-2xl font-bold">AI Studio Workspace</h1>
      </div>
      <div className="grid h-[calc(100vh-73px)] grid-cols-12">
        <aside className="col-span-2 border-r border-zinc-800 p-4">
          <h2 className="font-semibold">Repositories</h2>
        </aside>
        <section className="col-span-5 border-r border-zinc-800 p-4">
          <h2 className="font-semibold">AI Chat</h2>
        </section>
        <section className="col-span-5 p-4">
          <h2 className="font-semibold">Code Editor</h2>
        </section>
      </div>
    </main>
  );
}
