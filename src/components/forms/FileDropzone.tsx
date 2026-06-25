import { UploadCloud } from 'lucide-react';
import { type ChangeEvent, useMemo } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export function FileDropzone({
  label,
  accept,
  file,
  registration,
}: {
  label: string;
  accept: string;
  file?: File;
  registration: UseFormRegisterReturn;
}) {
  const preview = useMemo(() => (file && file.type.startsWith('image/') ? URL.createObjectURL(file) : ''), [file]);

  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
        {preview ? <img src={preview} alt="Preview" className="mb-3 h-20 w-20 rounded-md object-cover" /> : <UploadCloud className="mb-3 h-8 w-8 text-zinc-400" />}
        <span className="text-sm font-medium text-zinc-800">{file ? file.name : 'Drop a file or browse'}</span>
        <span className="mt-1 text-xs text-zinc-500">{accept}</span>
      </span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        {...registration}
        onChange={(event: ChangeEvent<HTMLInputElement>) => registration.onChange(event)}
      />
    </label>
  );
}
