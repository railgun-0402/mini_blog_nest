import { redirect } from 'next/navigation';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

const unauthorizedStatus: number = 401;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `リクエストに失敗しました (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
    } catch {
      // レスポンスボディがJSONでない場合はデフォルトメッセージを使う
    }
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(
  path: string,
  searchParams?: Record<string, string | undefined>,
): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Cookie: cookieStore.toString() },
  });

  if (res.status === unauthorizedStatus) {
    redirect('/login');
  }

  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithRefresh(new URL(path, API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

async function fetchWithRefresh(url: URL | string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (res.status !== unauthorizedStatus)  return res; // 401以外はそのまま返却

  const refreshRes = await fetch(new URL('/auth/refresh', API_BASE_URL), {
    method: 'POST',
    credentials: 'include',
  });

  if (!refreshRes.ok) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      redirect('/login');
    }
  }

  return fetch(url, init);
}

export type AuthUser = {
  id: string;
  email: string;
  organization: { id: string; name: string };
};

export async function login(email: string, password: string) {
  return apiPost<{ user: AuthUser }>('/auth/login', { email, password });
}

export async function register(
  email: string,
  password: string,
  organizationName: string,
) {
  return apiPost<{ user: AuthUser }>('/auth/register', {
    email,
    password,
    organizationName,
  });
}

export async function logout() {
  return apiPost<{ message: string }>('/auth/logout', {});
}
