'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, ApiError } from '@/lib/api';
import { CompanyTag, CreateTagInput } from '@/lib/types';

export function TagForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: CreateTagInput = { name };
      await apiPost<CompanyTag>(`/companies/${companyId}/tags`, payload);
      setName('');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '追加に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        required
        maxLength={50}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="タグ名"
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        追加
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
