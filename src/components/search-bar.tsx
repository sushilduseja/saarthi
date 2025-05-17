
"use client";

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ChangeEvent } from 'react';
import { useLanguage } from '@/contexts/language-context';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string; // Keep for potential direct override, but default to translated one
}

export function SearchBar({ searchTerm, onSearchChange, placeholder }: SearchBarProps) {
  const { t } = useLanguage();
  
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const currentPlaceholder = placeholder || t('searchPlaceholder');

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={currentPlaceholder}
        value={searchTerm}
        onChange={handleChange}
        className="pl-10 pr-4 py-2 w-full"
        aria-label={t('searchAriaLabel')}
      />
    </div>
  );
}
