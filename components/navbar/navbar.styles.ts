export const styles = {
  nav: (scrolled: boolean) => `
    fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 sm:px-6 md:px-12 py-3 sm:py-4
    ${scrolled ? "backdrop-blur-xl shadow-2xl shadow-black/50 bg-background/80" : "bg-transparent"}
  `,
  container: "max-w-7xl mx-auto flex items-center justify-between",
  logo: "flex items-center gap-2 group",
  logoIcon: "w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-primary-foreground transform group-hover:rotate-6 transition-transform shadow-lg shadow-primary/20",
  logoTextWrapper: "flex flex-col",
  logoTitle: "font-black text-xl leading-none",
  desktopNav: "hidden md:flex items-center gap-8",
  navLink: (isActive: boolean) => `
    text-sm font-bold transition-all uppercase relative group/nav whitespace-nowrap shrink-0
    ${isActive ? "text-primary" : "text-foreground/60 hover:text-primary"}
  `,
  activeIndicator: "absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]",
  hoverIndicator: "absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-center opacity-50",
  navGroup: "relative",
  navGroupTrigger: (isActive: boolean) => `
    flex items-center gap-1 text-sm font-bold uppercase transition-all relative group/nav cursor-pointer whitespace-nowrap shrink-0
    ${isActive ? "text-primary" : "text-foreground/60 hover:text-primary"}
  `,
  navGroupChevron: (isOpen: boolean) =>
    `transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`,
  navDropdownWrap: "absolute left-1/2 -translate-x-1/2 top-full pt-3 min-w-[210px] z-[120] animate-in fade-in slide-in-from-top-1 duration-200",
  navDropdownPanel: "bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2",
  navDropdownItem: (isActive: boolean) => `
    block px-5 py-2.5 text-sm font-bold uppercase transition-all
    ${isActive ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-primary hover:bg-white/5"}
  `,
  rightActions: "flex items-center gap-2",
  langButton: "p-2 text-foreground/40 hover:text-primary hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 flex items-center gap-1",
  langText: "text-xs font-black uppercase",
  actionButton: "hidden sm:flex p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  notifButton: "relative p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  notifBadge: "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-black rounded-full border-2 border-background flex items-center justify-center tabular-nums",
  chatButton: "relative p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  chatBadge: "absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-black rounded-full border-2 border-background flex items-center justify-center tabular-nums",
  chatDot: "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background",
  divider: "h-8 w-[1px] bg-white/5 mx-2 hidden sm:block",
  profileLink: (isActive: boolean, isRtl: boolean) => `
    flex items-center gap-3 ${isRtl ? "sm:pl-4 sm:pr-1" : "sm:pl-1 sm:pr-4"} sm:py-1 transition-all group rounded-full border
    ${isActive ? "bg-primary/20 border-primary/40 shadow-[0_0_15px_rgba(34,197,94,0.15)]" : "bg-white/5 border-white/10 hover:bg-white/10 overflow-hidden"}
  `,
  profileIconWrapper: (isActive: boolean) => `
    w-8 h-8 rounded-full flex items-center justify-center transition-all overflow-hidden
    ${isActive ? "bg-primary text-primary-foreground" : "bg-primary/20 border border-primary/30 text-primary"}
  `,
  profilePhotoImg: "w-full h-full object-cover",
  profileName: (isActive: boolean) => `
    text-sm font-bold hidden sm:block
    ${isActive ? "text-primary" : "text-foreground/80"}
  `,
  userMenuPanel: "absolute right-0 top-full mt-2 w-56 bg-surface border border-white/10 rounded-2xl shadow-2xl z-[120] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2",
  userMenuItem: "flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all",
  userMenuGroupTrigger: "flex items-center justify-between gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all cursor-pointer",
  userMenuGroupChevron: (isOpen: boolean) =>
    `transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`,
  userMenuSubPanel: (isOpen: boolean) =>
    `grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`,
  userMenuSubItem: "flex items-center gap-3 w-full ps-9 pe-4 py-2.5 text-sm font-bold text-foreground/60 hover:text-primary hover:bg-white/5 transition-all",
  userMenuDanger: "flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer text-left",
  userMenuDivider: "h-[1px] bg-white/5 my-1",
  mobileMenuBtn: (isOpen: boolean) => `
    md:hidden p-2.5 rounded-xl transition-all z-[110] relative
    ${isOpen ? "text-primary bg-primary/10" : "text-foreground/40 hover:text-foreground hover:bg-white/5"}
  `,
  mobileOverlay: (isOpen: boolean) => `
    fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] transition-all duration-500
    ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
  `,
  mobileMenu: (isOpen: boolean) => `
    md:hidden fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl px-6 pt-6 pb-8 flex flex-col transition-all duration-500
    ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
  `,
  mobileMenuHeader: "mb-8 flex items-center justify-between",
  mobileCloseBtn: "p-2.5 text-foreground/40 hover:text-primary hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  mobileNav: "flex flex-col gap-5",
  mobileNavLink: (active: boolean) => `
    text-lg font-black transition-all uppercase flex items-center gap-4 group/mobile
    ${active ? 'text-primary' : 'text-foreground/50 hover:text-foreground'}
  `,
  mobileGroupLabel: "text-xs font-black uppercase tracking-widest text-foreground/30",
  mobileLinkDot: "w-3 h-3 rounded-full bg-primary transform scale-0 group-hover/mobile:scale-100 transition-transform",
  mobileProfileChip: "flex items-center gap-3 mb-8 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all",
  mobileMoreItem: "flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all",
  mobileMoreGroupTrigger: "flex items-center justify-between gap-3 w-full px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all cursor-pointer",
  mobileMoreGroupChevron: (isOpen: boolean) =>
    `transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`,
  mobileMoreSubPanel: (isOpen: boolean) =>
    `grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`,
  mobileMoreSubItem: "flex items-center gap-3 w-full ps-8 pe-3 py-2 text-sm font-bold text-foreground/60 hover:text-primary hover:bg-white/5 rounded-lg transition-all",
  mobileLogout: "flex items-center gap-3 w-full px-3 py-3 text-base font-black uppercase text-red-500/80 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all text-left cursor-pointer",
  mobileFooter: "mt-auto pt-12 border-t border-white/5 opacity-50 text-xs font-bold uppercase",
};
