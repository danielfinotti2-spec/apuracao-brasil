'use client';

import { useState } from 'react';

export default function PixCopy({ pixKey, cta, copied }: { pixKey: string; cta: string; copied: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className="btn primary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(pixKey);
        } catch {
          const el = document.createElement('textarea');
          el.value = pixKey;
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          el.remove();
        }
        setOk(true);
        setTimeout(() => setOk(false), 1800);
      }}
    >
      {ok ? copied : cta}
    </button>
  );
}
