'use client';

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { SPECIALIZATIONS } from '@/constants/specializations';

interface SpecializationSelectProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

const styles = {
  container: "relative w-full",
  trigger: (isOpen: boolean) => `
    w-full min-h-[52px] pl-4 pr-10 py-3 bg-[#0D121F] border border-white/5
    transition-all duration-300 cursor-pointer flex items-center justify-between
    rounded-xl outline-none ${isOpen ? 'ring-2 ring-primary/20 border-primary/30' : ''}
  `,
  selectedText: (isPlaceholder: boolean) =>
    `text-sm font-medium ${isPlaceholder ? 'text-foreground/20' : 'text-foreground'}`,
  chevron: (isOpen: boolean) =>
    `text-foreground/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`,
  dropdown: `
    absolute z-50 w-full mt-2 bg-surface border border-white/5
    rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl
  `,
  scrollArea: "max-h-60 overflow-y-auto py-2 custom-scrollbar",
  option: (isSelected: boolean) => `
    px-4 py-3.5 flex items-center justify-between cursor-pointer
    transition-all duration-200 hover:bg-primary/5 active:scale-[0.98]
    ${isSelected ? 'bg-primary/5' : ''}
  `,
  optionText: (isSelected: boolean) =>
    `text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-foreground/70'}`,
  indicator: {
    active: "h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(34,197,94,0.8)]",
    inactive: "h-2 w-2 rounded-full bg-white/5 border border-white/10",
  },
};

export function SpecializationSelect({ value, onChange, placeholder }: SpecializationSelectProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = SPECIALIZATIONS.find((s) => s.value === value);
  const selectedLabel = selected ? t(selected.label as any) || selected.fallback : '';

  return (
    <div className={styles.container} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className={styles.trigger(isOpen)}>
        <span className={styles.selectedText(!selected)}>
          {selected ? selectedLabel : placeholder}
        </span>
        <ChevronDown size={18} className={styles.chevron(isOpen)} />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.scrollArea}>
            {SPECIALIZATIONS.map((spec) => {
              const isSelected = value === spec.value;
              return (
                <div
                  key={spec.id}
                  onClick={() => {
                    onChange(spec.value);
                    setIsOpen(false);
                  }}
                  className={styles.option(isSelected)}
                >
                  <span className={styles.optionText(isSelected)}>
                    {t(spec.label as any) || spec.fallback}
                  </span>
                  <div className={isSelected ? styles.indicator.active : styles.indicator.inactive} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
