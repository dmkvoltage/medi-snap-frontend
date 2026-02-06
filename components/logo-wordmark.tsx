'use client';

interface LogoWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const logoLetters = [
  { char: 'M', color: 'text-primary' },
  { char: 'e', color: 'text-destructive' },
  { char: 'd', color: 'text-accent' },
  { char: '8', color: 'text-secondary' },
  { char: 'd', color: 'text-primary' },
];

const sizeClasses: Record<NonNullable<LogoWordmarkProps['size']>, string> = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-3xl',
  lg: 'text-3xl sm:text-4xl',
};

export function LogoWordmark({ size = 'md', className = '' }: LogoWordmarkProps) {
  return (
    <span className={`font-semibold tracking-[-0.02em] leading-none ${sizeClasses[size]} ${className}`.trim()}>
      {logoLetters.map((letter, i) => (
        <span key={i} className={letter.color}>
          {letter.char}
        </span>
      ))}
    </span>
  );
}
