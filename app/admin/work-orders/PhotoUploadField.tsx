'use client';

import { useState } from 'react';

export default function PhotoUploadField() {
  const [urls, setUrls] = useState<string[]>([]); const [pending, setPending] = useState(false); const [error, setError] = useState<string | null>(null);
  async function upload(files: FileList | null) {
    if (!files?.length) return; setPending(true); setError(null);
    try {
      const added = await Promise.all(Array.from(files).map(async (file) => { const data = new FormData(); data.set('file', file); const response = await fetch('/api/admin/upload', { method: 'POST', body: data }); const body = await response.json() as { url?: string; error?: string }; if (!response.ok || !body.url) throw new Error(body.error ?? 'Upload failed.'); return body.url; }));
      setUrls((current) => [...current, ...added]);
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.'); } finally { setPending(false); }
  }
  return <div><input type="hidden" name="photos" value={urls.join('\n')} /><input type="file" accept="image/*" multiple onChange={(event) => upload(event.target.files)} className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-[#d01111]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#d01111] hover:file:bg-[#d01111]/15" />{pending && <p className="mt-2 text-xs text-zinc-500">Uploading photos…</p>}{error && <p className="mt-2 text-xs text-red-700">{error}</p>}{urls.length > 0 && <p className="mt-2 text-xs text-green-700">{urls.length} photo{urls.length === 1 ? '' : 's'} uploaded.</p>}</div>;
}
