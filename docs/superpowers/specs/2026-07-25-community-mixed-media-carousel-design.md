# Community Mixed-Media Carousel Design

## Goal

Allow a community post to contain up to five images and videos in any
combination. Multiple media items appear in a carousel that deliberately
reveals part of the next item. Selecting an item opens a fullscreen viewer
with navigation across every item in the post.

## Scope

This change covers:

- Creating a community post with one to five mixed media files.
- Previewing, removing, uploading, and publishing those files in selection
  order.
- Rendering existing and new multi-media posts as a carousel.
- Viewing images and videos in a fullscreen mixed-media viewer.
- Desktop, touch, keyboard, LTR, and RTL interactions.

Editing media on an existing post remains unchanged. Media reordering, captions
for individual media items, and more than five items are outside this scope.

## Existing System

`PostMedia` and the community create service already represent media as arrays.
The create modal currently replaces the previous selection with one file, while
the post card renders multiple media items in a grid. Direct uploads return
temporary R2 paths that are included in the final create-post payload.

The implementation will preserve these API contracts and replace only the
single-file selection and grid presentation behavior. If the backend rejects a
valid five-item mixed payload, that response will be surfaced as an upload or
publish error rather than silently dropping media.

## Create-Post Experience

The file input accepts `image/*,video/*`, enables `multiple`, and accepts no more
than five files in total. A selection may contain any mix of images and videos.
If adding a selection would exceed five, only available slots are accepted and
a localized limit message is shown.

Each accepted item has:

- A stable client-generated ID.
- Its original `File`.
- An object URL used for local preview.
- A derived media type.
- Upload state: pending, uploading, uploaded, or failed.
- Upload progress and, after success, its temporary R2 path.

Items remain in selection order regardless of upload completion order. Each
preview has a remove control. Removing an item revokes its object URL and
excludes its path from the final payload. Failed items remain visible with a
retry action and cannot be published.

Uploads use the existing direct-to-R2 flow. All retained items upload
concurrently, while progress is displayed per item. The publish button is disabled while any item
is pending, uploading, or failed. Publishing sends the uploaded paths in the
same order as the visible previews.

Closing or successfully submitting the modal resets all media state and revokes
all remaining object URLs.

## Feed Carousel

A post with one media item keeps the current full-width presentation. A post
with two to five items uses a reusable `PostMediaCarousel`.

The carousel uses native horizontal scrolling and CSS scroll snap:

- Each slide uses `calc((100% - var(--media-gap)) / 1.5)`, showing exactly one
  complete slide and half of the following slide within the rail viewport.
- The first slide aligns with the post content edge.
- Touch and trackpad scrolling work natively.
- Previous and next buttons appear when their respective directions are
  available.
- Position dots and an accessible item count identify the active slide.
- Slide position is derived from the nearest snapped item after scrolling.
- In RTL locales, visual direction and button behavior follow the document
  direction while logical next/previous order remains consistent.

Images use cover framing within a stable aspect ratio. Videos show their poster
frame and standard playback controls. Interacting with video controls must not
open the fullscreen viewer or navigate to post detail.

Selecting the visible media surface opens the fullscreen viewer at that item.
Media interaction is separated from the post-detail link so opening media does
not unintentionally navigate away.

## Fullscreen Mixed-Media Viewer

A reusable `MediaLightbox` accepts the full ordered `PostMedia[]`, an initial
index, and a close callback.

It provides:

- Full-viewport overlay with a dark backdrop.
- Contained images that preserve their aspect ratio.
- Videos with native controls and contained sizing.
- Previous and next arrow controls when more than one item exists.
- An item counter and position dots.
- Keyboard Left/Right navigation and Escape to close.
- Touch swipe navigation.
- Focus management, accessible labels, and background scroll locking.

Navigation pauses the video being left. Closing the viewer also pauses active
video playback. Arrow navigation wraps from the last item to the first and from
the first item to the last.

## Component Boundaries

- `AddCommunityPostModal` owns selection, upload orchestration, validation, and
  the ordered create payload.
- `CommunityMediaPicker` renders selected previews, progress, removal, retry,
  and the add-more control.
- `PostMedia` remains the image/video renderer and gains explicit interaction
  handling for preview versus playback.
- `PostMediaCarousel` owns scroll-snap layout, active-index tracking, arrows,
  dots, and opening the viewer.
- `MediaLightbox` owns fullscreen mixed-media navigation and media lifecycle.
- Small pure helpers own file-limit enforcement, ordered state updates, and
  carousel index calculations so those behaviors can be tested without a
  browser.

## Error Handling

- Unsupported selections are rejected with a localized message.
- Selections beyond five are truncated to available slots with a localized
  limit message.
- An upload failure marks only the affected item as failed and offers retry.
- Publish remains blocked until all retained items have uploaded.
- A publish failure preserves content and uploaded media so the user can retry.
- Broken remote media renders a non-destructive fallback without breaking
  carousel navigation.

## Accessibility and Responsive Behavior

- All icon controls have localized accessible names.
- Carousel and viewer controls are keyboard reachable with visible focus.
- The feed rail supports touch swipe without trapping vertical page scrolling.
- The modal preview rail collapses cleanly on mobile and does not overflow.
- Fullscreen controls remain reachable inside mobile safe areas.
- Reduced-motion preferences disable nonessential smooth transitions.

## Testing and Verification

Automated tests will cover:

- Accepting mixed images and videos in their selected order.
- Enforcing the five-item maximum when adding files incrementally.
- Removing and retrying individual uploads.
- Blocking publish during pending, uploading, or failed states.
- Building an ordered array of uploaded R2 paths.
- Active-slide calculation and arrow boundaries.
- Opening fullscreen at the selected slide.
- Fullscreen arrow, keyboard, close, and video-pause behavior.

Rendered verification will cover:

- One-media and five-media feed posts.
- The 1.5-card cue on desktop and mobile.
- Touch/trackpad scrolling and desktop arrows.
- Mixed image/video playback without accidental navigation.
- Fullscreen image and video navigation.
- LTR and RTL layouts.
- Relevant console errors and framework overlays.

## Success Criteria

A user can select up to five mixed images and videos, see each upload complete,
publish them in the chosen order, recognize from the partial next slide that the
post is horizontally scrollable, and open any item fullscreen with reliable
navigation through the entire media set.
