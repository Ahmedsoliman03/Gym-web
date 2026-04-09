'use client';

import { useRef, useState, useEffect } from 'react';

interface SpecializationDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}

const styles = {
  container: "relative min-w-[240px]",
  trigger: (isOpen: boolean) => `
    w-full min-h-[52px] pl-4 pr-10 py-2.5 bg-[#0D121F] border-2 
    transition-all duration-300 cursor-pointer flex items-center 
    rounded-xl font-body ${isOpen ? 'border-primary/30 ring-4 ring-primary/10' : 'border-transparent'}
  `,
  selectedText: (isPlaceholder: boolean) => `
    text-sm font-bold ${isPlaceholder ? 'text-foreground/40' : 'text-foreground'}
  `,
  dropdown: `
    absolute z-50 w-full mt-2 bg-surface border border-white/5 
    rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden 
    backdrop-blur-xl
  `,
  scrollArea: "max-h-60 overflow-y-auto py-2 custom-scrollbar",
  option: (isSelected: boolean) => `
    px-4 py-3.5 flex items-center justify-between cursor-pointer 
    transition-all duration-200 hover:bg-primary/5 active:scale-[0.98] 
    ${isSelected ? 'bg-primary/5' : ''}
  `,
  optionText: (isSelected: boolean) => `
    text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-foreground/70'}
  `,
  indicator: {
    active: "h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(34,197,94,0.8)]",
    inactive: "h-2 w-2 rounded-full bg-white/5 border border-white/10"
  }
};

export function SpecializationDropdown({
  value,
  onChange,
  options,
  placeholder,
}: SpecializationDropdownProps) {
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

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={styles.trigger(isOpen)}
      >
        <span className={styles.selectedText(value === 'All')}>
          {value === 'All' ? placeholder : value}
        </span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.scrollArea}>
            <div
              onClick={() => { onChange('All'); setIsOpen(false); }}
              className={styles.option(value === 'All')}
            >
              <span className={styles.optionText(value === 'All')}>
                {placeholder}
              </span>
              <div className={value === 'All' ? styles.indicator.active : styles.indicator.inactive} />
            </div>
            {options.map((option) => {
              const isSelected = value === option;
              return (
                <div
                  key={option}
                  onClick={() => { onChange(option); setIsOpen(false); }}
                  className={styles.option(isSelected)}
                >
                  <span className={styles.optionText(isSelected)}>
                    {option}
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
