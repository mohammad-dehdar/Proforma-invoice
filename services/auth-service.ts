export interface AuthUser {
  id: string;
  username: string;
}

interface BaseServiceResult {
  unauthorized?: boolean;
  message?: string;
}

const parseJson = async <T>(response: Response): Promise<T | undefined> => {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
};

export interface LoginResult extends BaseServiceResult {
  success: boolean;
  user?: AuthUser;
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResult> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const data = await parseJson<{ message?: string }>(response);
    return {
      success: false,
      message: data?.message ?? 'ورود ناموفق بود',
    };
  }

  const data = await parseJson<{ user: AuthUser }>(response);
  return { success: true, user: data?.user };
};

export const logout = async (): Promise<void> => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout request failed', error);
  }
};

export interface SessionResult extends BaseServiceResult {
  authenticated: boolean;
  user?: AuthUser | null;
}

export const checkSession = async (): Promise<SessionResult> => {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return { authenticated: false, user: null };
  }

  const data = await parseJson<{ user: AuthUser }>(response);
  return { authenticated: true, user: data?.user ?? null };
};
