'use client';

import { LogoWordmark } from '@/components/logo-wordmark';
import { Shield, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const footerLinks = [
  { label: 'Privacy Policy', href: '#privacy' },
  { label: 'Terms of Service', href: '#terms' },
  { label: 'Contact Support', href: '#contact' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="
      border-t border-border/60
      bg-gradient-to-b from-background to-muted/30
      relative
      overflow-hidden
    ">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 blur-3xl rounded-full" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative">
        
        {/* Main Footer Row */}
        <div className="
          py-8 sm:py-10
          flex flex-col items-center gap-6
          sm:flex-row sm:items-center sm:justify-between
        ">

          {/* Logo with glow */}
          <div className="relative group">
            <LogoWordmark size="md" className="flex-shrink-0" />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Links with hover effects */}
          <nav className="flex items-center gap-6 sm:gap-8" aria-label="Footer">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="
                  text-sm text-muted-foreground
                  hover:text-primary
                  transition-all duration-200
                  relative
                  after:content-['']
                  after:absolute
                  after:left-0
                  after:bottom-[-4px]
                  after:h-0.5
                  after:w-0
                  after:bg-gradient-to-r after:from-primary after:to-blue-500
                  after:transition-all after:duration-200
                  hover:after:w-full
                "
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Copyright with sparkle */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {currentYear} Med8d</span>
            <Sparkles className="h-3 w-3 text-primary/50" />
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-border to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 w-32 mx-auto rounded-full blur-sm" />
        </div>

        {/* Disclaimer with styled box */}
        <div className="py-6 sm:py-8">
          <div className="
            rounded-2xl
            bg-gradient-to-r from-muted/50 to-background
            border border-border/50
            p-5 sm:p-6
          ">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 flex-shrink-0">
                <Shield className="h-5 w-5 text-secondary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed text-center sm:text-left">
                  <span className="font-semibold text-foreground">Disclaimer:</span>{' '}
                  Med8d provides general medical information only and is not a substitute
                  for professional medical advice. Always consult your healthcare provider
                  for medical concerns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Made with love */}
        <div className="pb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <span>Made with</span>
          <Heart className="h-3 w-3 text-red-400 animate-pulse" />
          <span>for better healthcare understanding</span>
        </div>

      </div>
    </footer>
  );
}
