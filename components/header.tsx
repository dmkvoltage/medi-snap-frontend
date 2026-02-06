'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, Moon, Sun, User as UserIcon, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { LogoWordmark } from '@/components/logo-wordmark';

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

export function Header({ language = 'en', onLanguageChange }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const isDark = resolvedTheme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="
      sticky top-0 z-50
      bg-background/80 backdrop-blur-lg
      shadow-sm
      border-b border-border/50
    ">
      <div className="
        mx-auto max-w-5xl
        px-4 sm:px-6 lg:px-8
        h-16 sm:h-18
        flex items-center justify-between
      ">

        {/* ── Wordmark Logo ── */}
        <Link href="/" aria-label="Med8d home" className="flex items-center group">
          <LogoWordmark size="md" />
          {/* Animated sparkle on hover */}
          <Sparkles className="h-4 w-4 text-primary ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
        </Link>

        {/* ── Navigation & Controls ── */}
        <div className="flex items-center gap-2">
          
          {/* Theme Toggle with glow */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={mounted && isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="
              relative inline-flex items-center justify-center
              h-10 w-10
              rounded-full
              text-muted-foreground
              bg-transparent
              hover:bg-muted/60
              transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              hover:shadow-md hover:shadow-primary/10
            "
          >
            {mounted ? (
              isDark ? (
                <Sun className="h-5 w-5 text-amber-400 animate-pulse" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5 text-primary" aria-hidden="true" />
              )
            ) : (
              <Moon className="h-5 w-5 text-primary" aria-hidden="true" />
            )}
          </button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="
                inline-flex items-center justify-center gap-2
                h-10 px-4
                rounded-full
                text-sm font-medium text-foreground
                bg-muted/50 hover:bg-muted
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                hover:shadow-md
              ">
                <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="hidden sm:inline">{language.toUpperCase()}</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                w-56 rounded-2xl border border-border bg-card
                shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                p-2
                animate-in fade-in zoom-in-95 duration-200
              "
            >
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => onLanguageChange?.(lang.code)}
                  className={`
                    mx-1 px-3 py-2.5 rounded-xl cursor-pointer
                    text-sm transition-all duration-150
                    ${language === lang.code
                      ? 'bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary font-semibold'
                      : 'text-foreground hover:bg-muted/60'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    {lang.name}
                    {language === lang.code && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-primary inline-block animate-pulse" aria-hidden="true" />
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-border mx-2" />

          {/* Account Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="
                    h-10 w-10 rounded-full
                    border border-border/60
                    bg-gradient-to-br from-primary/10 to-secondary/10
                    text-foreground
                    flex items-center justify-center
                    text-sm font-semibold
                    shadow-sm
                    hover:shadow-lg hover:shadow-primary/20
                    transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                  "
                  aria-label="Account"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-500 text-white">
                    {user?.full_name ? user.full_name[0].toUpperCase() : user?.email[0].toUpperCase()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="
                  w-72 rounded-2xl border border-border bg-card
                  shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                  p-2
                  animate-in fade-in zoom-in-95 duration-200
                "
              >
                {/* User info */}
                <div className="px-3 py-3">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-base font-semibold text-foreground truncate">{user?.email}</p>
                </div>
                
                <div className="h-px bg-border my-2" />
                
                {/* Dashboard button */}
                <div className="px-3 py-2">
                  <Link href="/dashboard" className="w-full block">
                    <button
                      type="button"
                      className="
                        w-full h-11 rounded-xl
                        bg-gradient-to-r from-primary/10 to-blue-500/10
                        text-sm font-semibold text-primary
                        hover:from-primary/20 hover:to-blue-500/20
                        transition-all duration-200
                        flex items-center justify-center gap-2
                      "
                    >
                      <span>Dashboard</span>
                    </button>
                  </Link>
                </div>
                
                <div className="h-px bg-border my-2" />
                
                {/* Sign out */}
                <DropdownMenuItem 
                  onClick={logout} 
                  className="rounded-xl cursor-pointer text-destructive hover:bg-destructive/10 focus:text-destructive"
                >
                  <span className="font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button 
                size="lg" 
                className="
                  rounded-full
                  bg-gradient-to-r from-primary to-blue-600
                  text-white font-semibold
                  shadow-lg shadow-primary/25
                  hover:shadow-xl hover:shadow-primary/30
                  hover:scale-105
                  transition-all duration-200
                "
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
