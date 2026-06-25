import { Inbox } from 'lucide-react';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
      <Inbox className="mb-3 h-9 w-9 text-zinc-400" />
      <p className="font-semibold text-zinc-900">{title}</p>
      {description ? <p className="mt-1 max-w-md text-sm text-zinc-500">{description}</p> : null}
    </div>
  );
}
