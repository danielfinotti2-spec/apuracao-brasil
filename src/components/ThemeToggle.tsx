'use client';

import { useEffect, useState } from 'react';

/** Alterna tema claro/escuro do portal. Persiste em localStorage e respeita o sistema. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('fb-theme', next); } catch { /* modo privado */ }
  };

  return (
    <button className="theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? 'Clarear a tela' : 'Escurecer a tela'} title={theme === 'dark' ? 'Clarear a tela' : 'Escurecer a tela'}>
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.6" />
          <path d="M12 2.4 v2.2 M12 19.4 v2.2 M2.4 12 h2.2 M19.4 12 h2.2 M4.9 4.9 l1.6 1.6 M17.5 17.5 l1.6 1.6 M19.1 4.9 l-1.6 1.6 M6.5 17.5 l-1.6 1.6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.4 14.2 A8.6 8.6 0 0 1 9.8 3.6 a8.6 8.6 0 1 0 10.6 10.6 Z" />
        </svg>
      )}
    </button>
  );
}
