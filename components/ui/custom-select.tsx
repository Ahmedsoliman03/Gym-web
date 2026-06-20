'use client';

import { useRef, useState, useEffect, useId } from 'react';
import { ChevronDown24Regular } from '@fluentui/react-icons';

const styles = {
    container: "relative w-full",
    trigger: (isOpen: boolean, disabled?: boolean) => `
      w-full min-h-[44px] px-3 py-2 bg-[#0D121F] border-2
      transition-all duration-300 cursor-pointer flex items-center text-start
      rounded-xl outline-none
      focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10
      ${isOpen ? 'border-primary/30 ring-4 ring-primary/10' : 'border-transparent'}
      ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
    `,
    placeholder: "text-foreground/40 text-sm font-medium",
    value: "text-foreground text-sm font-bold truncate pr-6",
    chevronWrapper: "absolute inset-y-0 right-3 flex items-center text-foreground/40 pointer-events-none transition-colors duration-200",
    chevron: (isOpen: boolean) => `h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`,
    dropdown: (openUpwards?: boolean) => `absolute z-50 w-full ${openUpwards ? 'bottom-full mb-2' : 'mt-2'} bg-[#161B2B] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl`,
    optionsList: "max-h-48 overflow-y-auto py-1 custom-scrollbar",
    option: (isSelected: boolean, isActive: boolean) => `
      px-4 py-2.5 flex items-center justify-between cursor-pointer
      transition-all duration-200 active:scale-[0.98]
      ${isActive ? 'bg-primary/10' : 'hover:bg-primary/5'}
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
    onBlur?: () => void;
    options: Option[];
    placeholder: string;
    disabled?: boolean;
    className?: string;
    openUpwards?: boolean;
    'aria-label'?: string;
}

export function CustomSelect({ value, onChange, onBlur, options, placeholder, disabled, className, openUpwards, 'aria-label': ariaLabel }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
    const listboxId = useId();

    const selectedIndex = options.findIndex(o => o.value === value);
    const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    setIsOpen(false);
                    onBlur?.();
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onBlur]);

    // Keep the active (keyboard-highlighted) option scrolled into view.
    useEffect(() => {
        if (isOpen && activeIndex >= 0) {
            optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen, activeIndex]);

    const open = () => {
        if (disabled) return;
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        onBlur?.();
    };

    const commit = (index: number) => {
        const opt = options[index];
        if (!opt) return;
        onChange(opt.value);
        setIsOpen(false);
        onBlur?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) { open(); break; }
                setActiveIndex((i) => Math.min(i + 1, options.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!isOpen) { open(); break; }
                setActiveIndex((i) => Math.max(i - 1, 0));
                break;
            case 'Home':
                if (isOpen) { e.preventDefault(); setActiveIndex(0); }
                break;
            case 'End':
                if (isOpen) { e.preventDefault(); setActiveIndex(options.length - 1); }
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (!isOpen) { open(); break; }
                if (activeIndex >= 0) commit(activeIndex);
                break;
            case 'Escape':
                if (isOpen) { e.preventDefault(); close(); }
                break;
            case 'Tab':
                if (isOpen) close();
                break;
        }
    };

    const activeOptionId = isOpen && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

    return (
        <div className={`${styles.container} ${className}`} ref={containerRef}>
            <button
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-activedescendant={activeOptionId}
                aria-label={ariaLabel}
                disabled={disabled}
                onClick={() => (isOpen ? close() : open())}
                onKeyDown={handleKeyDown}
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
            </button>

            {isOpen && (
                <div className={styles.dropdown(openUpwards)}>
                    <ul className={styles.optionsList} role="listbox" id={listboxId} aria-label={ariaLabel}>
                        {options.map((option, index) => {
                            const isSelected = value === option.value;
                            const isActive = index === activeIndex;
                            return (
                                <li
                                    key={option.value}
                                    ref={(el) => { optionRefs.current[index] = el; }}
                                    id={`${listboxId}-opt-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => commit(index)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={styles.option(isSelected, isActive)}
                                >
                                    <span className={styles.optionText(isSelected)}>
                                        {option.label}
                                    </span>
                                    {isSelected ? (
                                        <div className={styles.optionIndicatorActive} />
                                    ) : (
                                        <div className={styles.optionIndicatorInactive} />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
