# Community Post Card Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split every self-contained logical block longer than approximately 50 lines out of `community-post-card.tsx` and change the feed carousel to dots-only navigation with no visible scrollbar.

**Architecture:** Extract presentation and interaction regions into typed sibling components while the card retains mutations, modal state, and orchestration. Media rendering, feed scrolling, and fullscreen viewing become independent components so carousel behavior no longer inflates the main card.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, next-intl, Lucide React.

## Global Constraints

- Extract a cohesive logical block when it exceeds approximately 50 lines.
- Do not change community APIs, post types, uploads, comments, moderation, voting, saving, or sharing.
- Keep the feed at one full slide plus half of the next slide.
- Hide feed scrollbars in WebKit, Firefox, and legacy Edge.
- Remove feed arrow buttons.
- Keep clickable feed dots, swipe, trackpad, and horizontal wheel navigation.
- Keep arrows, keyboard navigation, swipe, counter, and dots in fullscreen.
- Preserve unrelated profile working-tree changes.

---

### Task 1: Extract Media Rendering and Fullscreen Viewer

**Files:**
- Create: `features/community/components/community-post-media.tsx`
- Create: `features/community/components/community-media-viewer.tsx`
- Modify: `features/community/components/community-post-card.tsx`

**Interfaces:**
- `CommunityPostMedia` consumes:

```ts
interface CommunityPostMediaProps {
  file: string;
  mediaType: 'image' | 'video';
  className: string;
  onOpen(): void;
}
```

- `CommunityMediaViewer` consumes:

```ts
interface CommunityMediaViewerProps {
  media: PostMedia[];
  initialIndex: number;
  onClose(): void;
}
```

- [ ] Move the existing `PostMedia` implementation unchanged into
  `community-post-media.tsx`, rename it `CommunityPostMedia`, and export it as a
  named component.

- [ ] Move the complete existing `MediaViewer` implementation into
  `community-media-viewer.tsx`, replace `CommunityPost['media']` with
  `PostMedia[]`, and import `PostMedia` from `../types`.

- [ ] Import both extracted components into `community-post-card.tsx` and
  replace their local usages without changing props or behavior.

- [ ] Delete the old local implementations and remove imports used only by
  those implementations: `useCallback`, `X`, and fullscreen-only icons.

- [ ] Verify:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd features/community/components/community-post-media.tsx features/community/components/community-media-viewer.tsx features/community/components/community-post-card.tsx
```

Expected: both commands exit 0.

- [ ] Commit only Task 1 files:

```powershell
git add features/community/components/community-post-media.tsx features/community/components/community-media-viewer.tsx features/community/components/community-post-card.tsx
git commit -m "refactor: extract community media viewer"
```

---

### Task 2: Extract Dots-Only Feed Carousel

**Files:**
- Create: `features/community/components/community-media-carousel.tsx`
- Modify: `features/community/components/community-post-card.tsx`

**Interfaces:**
- `CommunityMediaCarousel` consumes:

```ts
interface CommunityMediaCarouselProps {
  media: PostMedia[];
}
```

- It imports `CommunityPostMedia` and `CommunityMediaViewer` from Task 1.

- [ ] Move `PostMediaCarousel` to `community-media-carousel.tsx`, rename it
  `CommunityMediaCarousel`, and replace `CommunityPost['media']` with
  `PostMedia[]`.

- [ ] Move these media-only styles from the card into the carousel module:

```ts
const styles = {
  wrapper: 'mt-2 relative',
  single: 'w-full aspect-video object-cover bg-black',
  rail:
    'community-media-rail flex gap-3 overflow-x-auto px-4 sm:px-6 pb-3 snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto',
  slide:
    'relative min-w-[calc((100%_-_0.75rem)/1.5)] aspect-video overflow-hidden rounded-xl bg-black snap-start',
  fill: 'w-full h-full object-cover bg-black',
};
```

- [ ] Remove both feed arrow branches and their `ChevronLeft` /
  `ChevronRight` imports from the carousel. Keep `scrollTo(index)` exclusively
  for clickable dots.

- [ ] Hide the native scrollbar in all required engines:

```tsx
<style jsx>{`
  .community-media-rail::-webkit-scrollbar { display: none; }
  .community-media-rail {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>
```

- [ ] Preserve the active-index calculation in `onScroll`, dot rendering,
  single-media presentation, 1.5-slide sizing, and fullscreen opening.

- [ ] Replace the card usage with:

```tsx
{post.media.length > 0 && <CommunityMediaCarousel media={post.media} />}
```

- [ ] Verify:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd features/community/components/community-media-carousel.tsx features/community/components/community-post-card.tsx
```

Expected: both commands exit 0 and no feed arrow JSX remains in
`community-media-carousel.tsx`.

- [ ] Commit only Task 2 files:

```powershell
git add features/community/components/community-media-carousel.tsx features/community/components/community-post-card.tsx
git commit -m "refactor: extract dots-only community carousel"
```

---

### Task 3: Extract Header, Content, and Engagement Regions

**Files:**
- Create: `features/community/components/community-post-header.tsx`
- Create: `features/community/components/community-post-content.tsx`
- Create: `features/community/components/community-post-engagement.tsx`
- Modify: `features/community/components/community-post-card.tsx`

**Interfaces:**
- `CommunityPostHeader` consumes author data, author link, ownership, menu
  state, pending save state, and callbacks:

```ts
interface CommunityPostHeaderProps {
  post: CommunityPost;
  authorHref?: string;
  isMine: boolean;
  menuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  savePending: boolean;
  onMenuToggle(): void;
  onEdit(): void;
  onDelete(): void;
  onSave(): void;
  onReport(): void;
}
```

- `CommunityPostContent` consumes:

```ts
interface CommunityPostContentProps {
  content: string;
  href?: string;
}
```

It owns its local expanded state and the 240-character threshold.

- `CommunityPostEngagement` consumes count, state, and callback props:

```ts
interface CommunityPostEngagementProps {
  liked: boolean;
  votePending: boolean;
  upVotes: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  onLike(): void;
  onComment(): void;
  onShare(): void;
  onOpenLikes(): void;
}
```

- [ ] Extract the entire author/header/menu JSX into
  `CommunityPostHeader`. Move header-only styles and icons with it. Keep all
  mutations and modal-state setters in the card by passing callbacks.

- [ ] Extract content truncation and See More/Less into
  `CommunityPostContent`. Move `contentExpanded`, `CONTENT_TRUNCATE_AT`,
  `contentNeedsToggle`, and content styles out of the card.

- [ ] Extract the counts bar and three action buttons into
  `CommunityPostEngagement`. Move engagement styles and icons with it; keep
  mutation callbacks in the card.

- [ ] Remove card imports and styles that moved into the extracted components.
  Keep only composition, mutation hooks, orchestration state, and existing
  modal components in `community-post-card.tsx`.

- [ ] Verify:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd features/community/components/community-post-header.tsx features/community/components/community-post-content.tsx features/community/components/community-post-engagement.tsx features/community/components/community-post-card.tsx
```

Expected: both commands exit 0.

- [ ] Commit only Task 3 files:

```powershell
git add features/community/components/community-post-header.tsx features/community/components/community-post-content.tsx features/community/components/community-post-engagement.tsx features/community/components/community-post-card.tsx
git commit -m "refactor: split community post card sections"
```

---

### Task 4: Final Static and Rendered Verification

**Files:**
- Modify only the extracted community components when verification finds a
  concrete defect.

- [ ] Run complete static verification:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd features/community/components/community-post-card.tsx features/community/components/community-post-header.tsx features/community/components/community-post-content.tsx features/community/components/community-post-engagement.tsx features/community/components/community-post-media.tsx features/community/components/community-media-carousel.tsx features/community/components/community-media-viewer.tsx
npm run build
git diff --check -- features/community/components
```

Expected: all commands exit 0.

- [ ] Inspect component sizes:

```powershell
Get-ChildItem features/community/components/community-post-*.tsx,features/community/components/community-media-*.tsx |
  ForEach-Object { [pscustomobject]@{ File=$_.Name; Lines=(Get-Content $_.FullName | Measure-Object -Line).Lines } }
```

Confirm `community-post-card.tsx` contains no remaining self-contained logical
rendering block over approximately 50 lines.

- [ ] Start the app with `npm run dev` and verify:

`/en/community -> multi-media post -> swipe/trackpad -> dots update -> click dot -> open fullscreen -> fullscreen arrows and keyboard`

- [ ] Repeat the feed carousel check on `/ar/community`.

- [ ] Confirm the feed has no visible scrollbar and no arrow controls at
desktop and mobile widths, while fullscreen still has arrows.

- [ ] If verification changes code, rerun every Task 4 command and commit:

```powershell
git add features/community/components
git commit -m "fix: verify community post component split"
```

Do not create an empty commit when no verification fixes are required.
