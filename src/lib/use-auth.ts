/**
 * Mock auth — to be replaced with @clerk/react when keys are available.
 * Persists session in localStorage.
 */
import { useEffect, useState } from 'react';

interface MockUser {
  id: string;
  email: string;
  name: string;
}

const STORAGE_KEY = 'fereloo:mock-auth';

function readUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readUser());
    setLoading(false);

    const onStorage = () => setUser(readUser());
    window.addEventListener('storage', onStorage);
    window.addEventListener('fereloo:auth-changed', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('fereloo:auth-changed', onStorage);
    };
  }, []);

  const signIn = (email: string) => {
    const u: MockUser = {
      id: 'usr_' + Math.random().toString(36).slice(2, 10),
      email,
      name: email.split('@')[0],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    window.dispatchEvent(new Event('fereloo:auth-changed'));
    setUser(u);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('fereloo:auth-changed'));
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
