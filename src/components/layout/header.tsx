
"use client";

import Link from 'next/link';
import { AppLogo } from '@/components/app-logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LanguageSelector } from '@/components/layout/language-selector';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { MessageSquare } from 'lucide-react';


export default function Header() {
  const pathname = usePathname(); 
  const { t } = useLanguage();

  const navItems = [
    { href: '/', labelKey: 'navHome' as const },
    { href: '/bookmarks', labelKey: 'navBookmarks' as const },
    { href: '/feedback', labelKey: 'navFeedback' as const, icon: MessageSquare }, // Added Feedback link
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <AppLogo />
        <nav className="hidden items-center space-x-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
