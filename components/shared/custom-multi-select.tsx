'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown24Regular, Dismiss20Regular } from '@fluentui/react-icons';

const styles = {
    container: "relative",
    trigger: (isOpen: boolean) => `
      w-full min-h-[52px] pl-4 pr-10 py-2.5 bg-[#0D121F] border-2 
      transition-all duration-300 cursor-pointer flex flex-wrap 
      gap-2 items-center rounded-xl 
      ${isOpen ? 'border-primary/30 ring-4 ring-primary/10' : 'border-transparent'}
    `,
    placeholder: "text-foreground/40 text-sm font-medium",
    tag: "flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-bold border border-primary/20 group/tag",
    tagClose: "hover:text-red-400 transition-colors flex items-center justify-center p-0.5 rounded-md hover:bg-black/20",
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

export interface MultiSelectOption {
    label: string;
    value: string;
}

export interface CustomMultiSelectProps {
    name?: string;
    value: string[];
    onChange: (value: string[]) => void;
    options: MultiSelectOption[];
    placeholder: string;
}

export function CustomMultiSelect({ value, onChange, options, placeholder }: CustomMultiSelectProps) {
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

    const toggleOption = (val: string) => {
        const newValue = value.includes(val)
            ? value.filter((v) => v !== val)
            : [...value, val];
        onChange(newValue);
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={styles.trigger(isOpen)}
            >
                {value.length === 0 && (
                    <span className={styles.placeholder}>{placeholder}</span>
                )}
                {value.map((val) => {
                    const option = options.find((o) => o.value === val);
                    return (
                        <div
                            key={val}
                            className={styles.tag}
                        >
                            {option?.label}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(val);
                                }}
                                className={styles.tagClose}
                            >
                                <Dismiss20Regular className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
                <div className={styles.chevronWrapper}>
                    <ChevronDown24Regular className={styles.chevron(isOpen)} />
                </div>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.optionsList}>
                        {options.map((option) => {
                            const isSelected = value.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => toggleOption(option.value)}
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
