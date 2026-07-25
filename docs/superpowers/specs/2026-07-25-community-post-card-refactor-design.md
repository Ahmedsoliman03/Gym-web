# Community Post Card Refactor Design

## Goal

Reduce `community-post-card.tsx` by extracting each self-contained logical
section that exceeds approximately 50 lines, while changing the feed media
carousel to use hidden scrollbars and dots-only navigation.

## Extraction Rule

Small state and coordination logic remains in `community-post-card.tsx`.
A cohesive rendering or interaction block longer than approximately 50 lines
moves into a focused component with explicit typed props.

The refactor extracts:

- `community-post-header.tsx`: author identity, timestamp, and options menu.
- `community-post-content.tsx`: truncation and See More/Less behavior.
- `community-post-media.tsx`: image/video rendering.
- `community-media-carousel.tsx`: feed scroll-snap rail and active dots.
- `community-media-viewer.tsx`: fullscreen media navigation.
- `community-post-engagement.tsx`: counts and Love/Comment/Share actions.

Existing comments, edit, delete, report, share, and voter components remain
unchanged.

## Main Card Responsibility

`community-post-card.tsx` remains responsible for:

- Mutation hooks and ownership checks.
- Modal open/closed state.
- Like, save, comment, share, delete, and report callbacks.
- Composing extracted sections and existing modal components.

It passes data and callbacks to extracted components rather than duplicating
mutation or routing behavior.

## Feed Carousel Behavior

- One media item remains full width.
- Two to five items retain the 1.5-slide scroll-snap layout.
- Native scrollbars are hidden in WebKit, Firefox, and legacy Edge.
- Feed previous/next arrow buttons are removed.
- Clickable active-position dots remain below the rail.
- Touch swipe, trackpad, mouse-wheel horizontal scrolling, and dot navigation
  remain available.
- The fullscreen viewer keeps arrows, keyboard navigation, swipe, counter, and
  dots.

## Compatibility

The refactor does not change community API payloads, upload behavior, post data
types, comments, editing, moderation, voting, saving, or sharing behavior.
English and Arabic accessibility labels continue to use the existing community
translation keys.

## Verification

- TypeScript and targeted ESLint must pass.
- The production build must pass.
- Feed media must show no scrollbar or feed arrows.
- Dots must update after scrolling and navigate when clicked.
- Fullscreen navigation must retain arrows and keyboard behavior.
- Single-media and mixed-media posts must continue rendering.
- LTR and RTL feed layouts must remain usable.
