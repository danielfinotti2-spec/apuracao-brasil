// Ícones sociais em SVG próprio (Instagram, X, GitHub) — sem fontes externas.

type IconProps = { label: string; href: string; children: React.ReactNode };

const wrap: React.CSSProperties = { display: 'inline-flex', width: 20, height: 20 };

function Icon({ label, href, children }: IconProps) {
  return (
    <a className="social-icon" href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} style={wrap}>
      {children}
    </a>
  );
}

export default function SocialLinks() {
  return (
    <span className="social-links icons">
      <Icon label="Instagram @euodeene" href="https://www.instagram.com/euodeene">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" role="img" aria-hidden="true">
          <rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.2" />
          <circle cx="12" cy="12" r="4.3" />
          <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </Icon>
      <Icon label="X (Twitter) @euodeene" href="https://x.com/euodeene">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" role="img" aria-hidden="true">
          <path d="M4.2 3.5 10.6 12.6 4.4 20.5 h2.1 l5 -6.2 3.9 6.2 h5.3 l-6.9-9.8 5.9-7.2 h-2.1 l-4.7 5.8 -3.7-5.8 Z" />
        </svg>
      </Icon>
      <Icon label="GitHub do projeto" href="https://github.com/danielfinotti2-spec">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" role="img" aria-hidden="true">
          <path d="M9 19.5 c-4.2 1.4 -4.2 -3 -5.8 -3.6 M14.8 21.5 v-3.4 c0 -1 0 -1.4 -0.3 -1.9 3.3 -0.4 6.7 -1.6 6.7 -7.2 0 -1.6 -0.6 -2.9 -1.5 -3.9 0.1 -0.4 0.6 -1.9 -0.1 -4 0 0 -1.2 -0.4 -4 1.5 a13.3 13.3 0 0 0 -7.2 0 c-2.8 -1.9 -4 -1.5 -4 -1.5 -0.7 2.1 -0.2 3.6 -0.1 4 -0.9 1 -1.5 2.3 -1.5 3.9 0 5.6 3.4 6.8 6.7 7.2 -0.2 0.2 -0.3 0.6 -0.4 1.1 v4.4" />
        </svg>
      </Icon>
    </span>
  );
}
