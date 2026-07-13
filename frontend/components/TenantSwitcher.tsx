'use client';

import { useState } from 'react';

const TENANTS = ['テスト組織', '株式会社サンプル', '合同会社デモ'];

export function TenantSwitcher() {
  const [tenant, setTenant] = useState(TENANTS[0]);

  return (
    <select
      value={tenant}
      onChange={(e) => setTenant(e.target.value)}
      aria-label="テナント切り替え"
      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
    >
      {TENANTS.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
