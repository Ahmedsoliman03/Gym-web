export const settingsStyles = {
    formWrapper: 'space-y-5',
    input: 'w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium',
    label: 'text-[11px] font-bold text-foreground/50 px-1 uppercase mb-2 block',
    error: 'text-red-500 text-[10px] mt-1 px-1',
    submitButton:
        'w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:brightness-110 active:scale-[0.99] transition-all text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed',
    sectionLabel:
        'mt-5 mb-3 text-[11px] font-black uppercase tracking-wider text-foreground/40',
    row: 'flex items-center justify-between gap-4 py-3 border-b border-white/[0.04] last:border-b-0',
    rowText: 'min-w-0',
    rowTitle: 'text-sm font-bold text-foreground',
    rowDesc: 'text-xs text-foreground/40 mt-0.5',
    pillGroup:
        'inline-flex items-center bg-white/[0.04] border border-white/5 rounded-xl p-1 shrink-0',
    pill: 'px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider text-foreground/50 hover:text-foreground transition-all',
    pillActive:
        'bg-primary text-primary-foreground hover:text-primary-foreground',
    toggle:
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors border border-white/10',
    toggleOn: 'bg-primary/80',
    toggleOff: 'bg-white/[0.06]',
    toggleKnob:
        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200',
    toggleKnobOn: 'translate-x-5',
    toggleKnobOff: 'translate-x-0.5',
    saveRow: 'flex justify-end pt-5 mt-1 border-t border-white/[0.04]',
    dirtyHint:
        'text-[11px] font-bold uppercase tracking-wider text-foreground/40 me-auto self-center',
};
