'use client';

import * as React from 'react';
import { Select as BaseSelect, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface SelectWithErrorProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function SelectWithError({ 
  children, 
  value, 
  onValueChange, 
  placeholder, 
  error, 
  className 
}: SelectWithErrorProps) {
  return (
    <div className="space-y-2">
      <BaseSelect value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`${error ? 'border-destructive focus:ring-destructive' : ''} ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </BaseSelect>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}