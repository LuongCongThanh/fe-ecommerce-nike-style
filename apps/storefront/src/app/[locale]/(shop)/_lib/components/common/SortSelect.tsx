'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/base/select';
import { SORT_OPTIONS, type SortOption } from '@/shared/constants/app-config';

interface SortSelectProps {
  readonly value?: SortOption;
  readonly onValueChange?: (value: SortOption) => void;
  readonly placeholder?: string;
}

export function SortSelect({ value, onValueChange, placeholder = 'Sắp xếp' }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={(nextValue) => onValueChange?.(nextValue as SortOption)}>
      <SelectTrigger className="w-55">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
