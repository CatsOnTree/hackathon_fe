import { ArrowDownUp } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Spinner } from './Loading';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | undefined;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyTitle?: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function DataTable<T>({ data, columns, isLoading, emptyTitle = 'No records found', sortKey, sortDirection, onSort }: Props<T>) {
  if (isLoading) {
    return (
      <div className="surface flex min-h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!data.length) return <EmptyState title={emptyTitle} />;

  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {column.sortValue && onSort ? (
                    <button className="inline-flex items-center gap-1" onClick={() => onSort(column.key)}>
                      {column.header}
                      <ArrowDownUp className={`h-3.5 w-3.5 ${sortKey === column.key ? 'text-emerald-600' : ''}`} />
                      {sortKey === column.key ? <span className="sr-only">{sortDirection}</span> : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-zinc-50">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-4 py-3 text-zinc-700">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
