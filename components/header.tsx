'use client';

import Link from 'next/link';
import { Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
];

// Google colors each letter of "MediSnap" — cycling Blue, Red, Yellow, Green
// exactly the way Google colors G-o-o-g-l-e
const logoLetters = [
  { char: 'M', color: 'text-primary' },      // Blue
  { char: 'e', color: 'text-destructive' },   // Red
  { char: 'd', color: 'text-accent' },        // Yellow
  { char: 'i', color: 'text-secondary' },     // Green
  { char: 'S', color: 'text-primary' },       // Blue
  { char: 'n', color: 'text-destructive' },   // Red
  { char: 'a', color: 'text-accent' },        // Yellow
  { char: 'p', color: 'text-secondary' },     // Green
];

export function Header({ language = 'en', onLanguageChange }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="
      sticky top-0 z-50
      bg-background
      shadow-[0_1px_3px_rgba(0,0,0,0.08)]
    ">
      <div className="
        mx-auto max-w-5xl
        px-4 sm:px-6 lg:px-8
        h-14 sm:h-16
        flex items-center justify-between
      ">

        {/* ── Wordmark Logo ──
            No icon badge. The colored wordmark IS the logo,
            exactly like Google colors its own name. */}
        <Link href="/" aria-label="MediSnap home" className="flex items-center">
          <span className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] leading-none">
            {logoLetters.map((letter, i) => (
              <span key={i} className={letter.color}>
                {letter.char}
              </span>
            ))}
          </span>
        </Link>

        {/* ── Language Selector ──
            Google ghost button: no bg at rest, muted text,
            hover adds a subtle muted fill. Pill shaped. */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="
              inline-flex items-center justify-center
              h-9 w-9
              rounded-full
              text-muted-foreground
              bg-transparent
              hover:bg-muted/50
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            "
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="
              inline-flex items-center justify-center gap-2
              h-9 px-3.5
              rounded-full
              text-sm font-medium text-muted-foreground
              bg-transparent
              hover:bg-muted/50
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            ">
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span>{language.toUpperCase()}</span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="
              w-48 rounded-xl border border-border bg-card
              shadow-[0_4px_16px_rgba(0,0,0,0.1)]
              py-1.5
            "
          >
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => onLanguageChange?.(lang.code)}
                className={`
                  mx-1.5 px-3 py-2 rounded-lg cursor-pointer
                  text-sm transition-colors duration-100
                  ${language === lang.code
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <span>{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-primary inline-block" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
}
