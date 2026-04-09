'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown24Regular } from '@fluentui/react-icons';

const styles = {
    container: "relative w-full",
    trigger: (isOpen: boolean, disabled?: boolean) => `
      w-full min-h-[52px] px-4 py-3 bg-[#0D121F] border-2 
      transition-all duration-300 cursor-pointer flex items-center 
      rounded-xl 
      ${isOpen ? 'border-primary/30 ring-4 ring-primary/10' : 'border-transparent'}
      ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    `,
    placeholder: "text-foreground/40 text-sm font-medium",
    value: "text-foreground text-sm font-bold truncate pr-6",
    chevronWrapper: "absolute inset-y-0 right-3 flex items-center text-foreground/30 pointer-events-none transition-colors duration-200",
    chevron: (isOpen: boolean) => `h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`,
    dropdown: "absolute z-50 w-full mt-2 bg-[#161B2B] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl",
    optionsList: "max-h-60 overflow-y-auto py-2 custom-scrollbar",
    option: (isSelected: boolean) => `
      px-4 py-3.5 flex items-center justify-between cursor-pointer 
      transition-all duration-200 hover:bg-primary/5 active:scale-[0.98] 
      ${isSelected ? 'bg-primary/5' : ''}
    `,
    optionText: (isSelected: boolean) => `text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-foreground/70'}`,
    optionIndicatorActive: "h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(34,197,94,0.8)]",
    optionIndicatorInactive: "h-2 w-2 rounded-full bg-white/5 border border-white/10"
};

interface Option {
    label: string;
    value: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder: string;
    disabled?: boolean;
    className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder, disabled, className }: CustomSelectProps) {
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

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className={`${styles.container} ${className}`} ref={containerRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={styles.trigger(isOpen, disabled)}
            >
                {!value ? (
                    <span className={styles.placeholder}>{placeholder}</span>
                ) : (
                    <span className={styles.value}>{selectedOption?.label}</span>
                )}
                <div className={styles.chevronWrapper}>
                    <ChevronDown24Regular className={styles.chevron(isOpen)} />
                </div>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.optionsList}>
                        {options.map((option) => {
                            const isSelected = value === option.value;
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={styles.option(isSelected)}
                                >
                                    <span className={styles.optionText(isSelected)}>
                                        {option.label}
                                    </span>
                                    {isSelected ? (
                                        <div className={styles.optionIndicatorActive} />
                                    ) : (
                                        <div className={styles.optionIndicatorInactive} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
