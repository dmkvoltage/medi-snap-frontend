'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/', label: 'Home', public: true },
  { href: '/upload', label: 'Upload', public: true },
  { href: '/loading', label: 'Workflow', public: true },
];

interface PageNavProps {
  className?: string;
}

export function PageNav({ className }: PageNavProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const visibleItems = navItems.filter(item => 
    item.public || (item.public === false && isAuthenticated)
  );

  // Add results and dashboard for authenticated users
  const finalItems = isAuthenticated 
    ? [
        ...visibleItems, 
        { href: '/recent', label: 'Results', public: false },
        { href: '/dashboard', label: 'History', public: false }
      ]
    : visibleItems;

  return (
    <div className={cn('w-full', className)}>
      <nav
        aria-label="Page navigation"
        className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <div className="border-b border-border/60 bg-background">
          <div className="flex items-center justify-center gap-4 overflow-x-auto">
            {finalItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href === '/dashboard' && pathname.startsWith('/interpret/')) ||
                (item.href === '/recent' && pathname.startsWith('/results'));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap px-1 py-3 text-xs sm:text-sm font-medium transition-colors relative',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
