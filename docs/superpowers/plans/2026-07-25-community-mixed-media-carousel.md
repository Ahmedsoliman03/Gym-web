# Community Mixed-Media Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users publish up to five mixed images/videos and browse multi-media posts in a 1.5-slide carousel with a navigable fullscreen viewer.

**Architecture:** Keep the existing community API and direct-to-R2 upload flow. Add a pure ordered media-state module, a focused create-modal picker, a reusable feed carousel, and a mixed-media lightbox; the post card becomes composition glue. Native scroll snap provides touch interaction without a new dependency.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, next-intl, Lucide React, Axios/R2 uploads, Node `node:test`.

## Global Constraints

- A post accepts zero to five media files.
- Images and videos may be mixed in the same post.
- Media order matches the user's selection order.
- Multiple media items render as exactly 1.5 visible slides using `calc((100% - var(--media-gap)) / 1.5)`.
- Use native scrolling and CSS scroll snap; add no carousel dependency.
- Publishing is disabled while retained media is pending, uploading, or failed.
- Fullscreen viewing supports images, videos, arrows, keyboard, swipe, counter, and close.
- Existing post editing behavior remains unchanged.
- Preserve all unrelated working-tree changes, especially the uncommitted profile fixes.

---

## File Structure

- Create `features/community/utils/community-media-state.ts`: pure selection, upload-state, ordering, limit, and navigation helpers.
- Create `features/community/utils/community-media-state.test.ts`: native Node regression tests for the pure helper contract.
- Create `features/community/components/community-media-picker.tsx`: create-modal previews, progress, retry, remove, and add-more UI.
- Modify `features/community/components/add-community-post-modal.tsx`: own media state, concurrent uploads, cleanup, and ordered submission.
- Modify `features/community/services/community.service.ts`: append uploaded R2 paths as `media_urls` while retaining `File` support.
- Create `features/community/components/post-media.tsx`: shared image/video renderer with explicit preview and fullscreen variants.
- Create `features/community/components/media-lightbox.tsx`: fullscreen mixed-media viewing and navigation.
- Create `features/community/components/post-media-carousel.tsx`: 1.5-slide feed rail, active index, arrows, dots, and lightbox opening.
- Modify `features/community/components/community-post-card.tsx`: replace the grid and linked media region with the reusable carousel.
- Modify `messages/en.json`: add picker, upload, carousel, and fullscreen labels.
- Modify `messages/ar.json`: add the matching Arabic labels.

---

### Task 1: Ordered Mixed-Media State

**Files:**
- Create: `features/community/utils/community-media-state.ts`
- Create: `features/community/utils/community-media-state.test.ts`

**Interfaces:**
- Produces:
  - `MAX_COMMUNITY_MEDIA = 5`
  - `type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed'`
  - `interface SelectedCommunityMedia`
  - `isSupportedCommunityMedia(file)`
  - `appendSelectedMedia(current, files, createId, createObjectUrl)`
  - `patchSelectedMedia(items, id, patch)`
  - `removeSelectedMedia(items, id)`
  - `getPublishableMediaPaths(items)`
  - `isMediaPublishBlocked(items)`
  - `getWrappedMediaIndex(index, delta, length)`
- Consumes: no application modules; keep this file independently compilable.

- [ ] **Step 1: Write the failing state tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  appendSelectedMedia,
  getPublishableMediaPaths,
  getWrappedMediaIndex,
  isMediaPublishBlocked,
  patchSelectedMedia,
} from "./community-media-state";

test("accepts mixed files in order and stops at five", () => {
  const files = [
    { name: "1.jpg", type: "image/jpeg" },
    { name: "2.mp4", type: "video/mp4" },
    { name: "3.webp", type: "image/webp" },
    { name: "4.mov", type: "video/quicktime" },
    { name: "5.png", type: "image/png" },
    { name: "6.jpg", type: "image/jpeg" },
    { name: "notes.pdf", type: "application/pdf" },
  ] as File[];
  let id = 0;

  const result = appendSelectedMedia([], files, () => `id-${++id}`, (file) => `blob:${file.name}`);

  assert.equal(result.items.length, 5);
  assert.equal(result.rejectedCount, 2);
  assert.deepEqual(result.items.map((item) => item.mediaType), [
    "image", "video", "image", "video", "image",
  ]);
});

test("keeps publish paths in visible order after concurrent uploads", () => {
  const seeded = appendSelectedMedia(
    [],
    [
      { name: "first.jpg", type: "image/jpeg" },
      { name: "second.mp4", type: "video/mp4" },
    ] as File[],
    (file) => file.name,
    (file) => `blob:${file.name}`,
  ).items;
  const secondDone = patchSelectedMedia(seeded, "second.mp4", {
    status: "uploaded",
    uploadedPath: "temp/community/second.mp4",
  });
  const bothDone = patchSelectedMedia(secondDone, "first.jpg", {
    status: "uploaded",
    uploadedPath: "temp/community/first.jpg",
  });

  assert.deepEqual(getPublishableMediaPaths(bothDone), [
    "temp/community/first.jpg",
    "temp/community/second.mp4",
  ]);
  assert.equal(isMediaPublishBlocked(bothDone), false);
});

test("pending, uploading, and failed items block publish", () => {
  const item = appendSelectedMedia(
    [],
    [{ name: "photo.jpg", type: "image/jpeg" }] as File[],
    () => "photo",
    () => "blob:photo",
  ).items;

  assert.equal(isMediaPublishBlocked(item), true);
  assert.equal(isMediaPublishBlocked(patchSelectedMedia(item, "photo", { status: "failed" })), true);
});

test("fullscreen navigation wraps at both ends", () => {
  assert.equal(getWrappedMediaIndex(4, 1, 5), 0);
  assert.equal(getWrappedMediaIndex(0, -1, 5), 4);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```powershell
$out = '.tmp-community-media-test'
.\node_modules\.bin\tsc.cmd features/community/utils/community-media-state.ts features/community/utils/community-media-state.test.ts --outDir $out --module commonjs --moduleResolution node --target es2020 --lib es2020,dom --esModuleInterop --skipLibCheck
node --test "$out\community-media-state.test.js"
```

Expected: FAIL because the helper module or exports do not exist.

- [ ] **Step 3: Implement the minimal pure state module**

```ts
export const MAX_COMMUNITY_MEDIA = 5;

export type UploadStatus = "pending" | "uploading" | "uploaded" | "failed";
export type CommunityMediaType = "image" | "video";

export interface SelectedCommunityMedia {
  id: string;
  file: File;
  previewUrl: string;
  mediaType: CommunityMediaType;
  status: UploadStatus;
  progress: number;
  uploadedPath?: string;
}

export const isSupportedCommunityMedia = (file: File) =>
  file.type.startsWith("image/") || file.type.startsWith("video/");

export function appendSelectedMedia(
  current: SelectedCommunityMedia[],
  files: readonly File[],
  createId: (file: File) => string,
  createObjectUrl: (file: File) => string,
) {
  const supported = files.filter(isSupportedCommunityMedia);
  const accepted = supported.slice(0, Math.max(0, MAX_COMMUNITY_MEDIA - current.length));
  return {
    items: [
      ...current,
      ...accepted.map((file) => ({
        id: createId(file),
        file,
        previewUrl: createObjectUrl(file),
        mediaType: file.type.startsWith("video/") ? "video" as const : "image" as const,
        status: "pending" as const,
        progress: 0,
      })),
    ],
    rejectedCount: files.length - accepted.length,
  };
}

export const patchSelectedMedia = (
  items: SelectedCommunityMedia[],
  id: string,
  patch: Partial<Omit<SelectedCommunityMedia, "id" | "file" | "previewUrl" | "mediaType">>,
) => items.map((item) => item.id === id ? { ...item, ...patch } : item);

export const removeSelectedMedia = (items: SelectedCommunityMedia[], id: string) =>
  items.filter((item) => item.id !== id);

export const getPublishableMediaPaths = (items: SelectedCommunityMedia[]) =>
  items.map((item) => item.uploadedPath).filter((path): path is string => Boolean(path));

export const isMediaPublishBlocked = (items: SelectedCommunityMedia[]) =>
  items.some((item) => item.status !== "uploaded");

export const getWrappedMediaIndex = (index: number, delta: number, length: number) =>
  length === 0 ? 0 : (index + delta + length) % length;
```

- [ ] **Step 4: Run tests and type-check**

Run the Step 2 command again, then:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
```

Expected: four tests PASS and TypeScript exits 0.

- [ ] **Step 5: Remove temporary output and commit**

```powershell
$target = (Resolve-Path -LiteralPath '.tmp-community-media-test').Path
if ($target -ne 'D:\gym\projects\gym-web\.tmp-community-media-test') { throw "Unexpected target: $target" }
Remove-Item -LiteralPath $target -Recurse -Force
git add features/community/utils/community-media-state.ts features/community/utils/community-media-state.test.ts
git commit -m "test: define community mixed media state"
```

---

### Task 2: Mixed-Media Picker and Concurrent Uploads

**Files:**
- Create: `features/community/components/community-media-picker.tsx`
- Modify: `features/community/components/add-community-post-modal.tsx`
- Modify: `features/community/services/community.service.ts`
- Modify: `messages/en.json`
- Modify: `messages/ar.json`

**Interfaces:**
- Consumes all `SelectedCommunityMedia` state helpers from Task 1.
- Produces:

```ts
interface CommunityMediaPickerProps {
  items: SelectedCommunityMedia[];
  disabled?: boolean;
  onSelect(files: File[]): void;
  onRemove(id: string): void;
  onRetry(id: string): void;
}
```

- [ ] **Step 1: Add a failing service contract test**

Extend `community-media-state.test.ts` and export the dependency-free
`appendCommunityMedia(formData, media)` helper from
`community-media-state.ts`:

```ts
test("appends uploaded paths as media_urls in order", () => {
  const formData = new FormData();
  appendCommunityMedia(formData, [
    "temp/community/first.jpg",
    "temp/community/second.mp4",
  ]);

  assert.deepEqual(formData.getAll("media_urls"), [
    "temp/community/first.jpg",
    "temp/community/second.mp4",
  ]);
  assert.deepEqual(formData.getAll("media"), []);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run the Task 1 test command.

Expected: FAIL because `appendCommunityMedia` is missing.

- [ ] **Step 3: Implement ordered path submission**

Add:

```ts
export function appendCommunityMedia(
  formData: FormData,
  media: readonly (File | string)[],
) {
  media.forEach((item) => {
    if (typeof item === "string") formData.append("media_urls", item);
    else formData.append("media", item);
  });
}
```

Use it from `createPost` so direct-upload strings are never appended under the
binary `media` field.

- [ ] **Step 4: Build the picker component**

Render an ordered responsive rail of preview cards. Each card must:

- Render `<img>` for images and `<video muted playsInline preload="metadata">`
  for videos.
- Show per-item progress for `uploading`.
- Show a localized failure state and retry button for `failed`.
- Expose a localized remove button for every retained item.
- Render an add-more file input with `multiple`, `accept="image/*,video/*"`,
  and hide it when five items are selected.
- Display localized `{count}/5` media count.

- [ ] **Step 5: Replace single-media modal state**

In `AddCommunityPostModal`:

```ts
const [media, setMedia] = useState<SelectedCommunityMedia[]>([]);
const mediaRef = useRef(media);

const commitMedia = (next: SelectedCommunityMedia[]) => {
  mediaRef.current = next;
  setMedia(next);
};
```

Implement `uploadItem(id)` using the existing `uploadFile`:

```ts
const uploadItem = async (id: string) => {
  const selected = mediaRef.current.find((item) => item.id === id);
  if (!selected) return;
  commitMedia(patchSelectedMedia(mediaRef.current, id, {
    status: "uploading",
    progress: 0,
  }));
  try {
    const uploadedPath = await uploadFile(
      selected.file,
      "community_post",
      (progress) => commitMedia(
        patchSelectedMedia(mediaRef.current, id, { progress }),
      ),
    );
    commitMedia(patchSelectedMedia(mediaRef.current, id, {
      status: "uploaded",
      progress: 100,
      uploadedPath,
    }));
  } catch {
    commitMedia(patchSelectedMedia(mediaRef.current, id, { status: "failed" }));
  }
};
```

When files are selected, append them once, warn if `rejectedCount > 0`, then
start all newly accepted uploads with `void Promise.all(...)`. Do not let upload
completion reorder items.

Remove an item by revoking only its `previewUrl`, then deleting it from state.
Retry calls `uploadItem(id)`. Modal close and successful publish revoke all
remaining object URLs.

- [ ] **Step 6: Update publish behavior and copy**

Submit:

```ts
media: getPublishableMediaPaths(mediaRef.current)
```

Disable publish when:

```ts
isPending ||
isMediaPublishBlocked(media) ||
(!values.content.trim() && media.length === 0)
```

Add exact English keys:

```json
"mediaLimit": "You can add up to 5 photos or videos.",
"mediaCount": "{count}/5 selected",
"addMoreMedia": "Add more",
"uploadingMedia": "Uploading {progress}%",
"uploadFailed": "Upload failed",
"retryUpload": "Retry upload",
"previousMedia": "Previous media",
"nextMedia": "Next media",
"openMedia": "Open media {index} of {count}",
"closeMediaViewer": "Close media viewer",
"mediaPosition": "{index} of {count}"
```

Add accurate Arabic translations for the same keys without changing existing
message encoding or unrelated text.

- [ ] **Step 7: Verify and commit**

Run:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd features/community/components/community-media-picker.tsx features/community/components/add-community-post-modal.tsx features/community/services/community.service.ts features/community/utils/community-media-state.ts features/community/utils/community-media-state.test.ts
node -e "JSON.parse(require('fs').readFileSync('messages/ar.json','utf8')); JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('locale JSON valid')"
```

Expected: all commands exit 0.

Commit:

```powershell
git add features/community/components/community-media-picker.tsx features/community/components/add-community-post-modal.tsx features/community/services/community.service.ts features/community/utils/community-media-state.ts features/community/utils/community-media-state.test.ts messages/en.json messages/ar.json
git commit -m "feat: upload mixed media in community posts"
```

---

### Task 3: Fullscreen Mixed-Media Viewer

**Files:**
- Create: `features/community/components/post-media.tsx`
- Create: `features/community/components/media-lightbox.tsx`
- Modify: `features/community/utils/community-media-state.test.ts`

**Interfaces:**
- Consumes `PostMedia` from `features/community/types.ts`.
- Consumes `getWrappedMediaIndex` from Task 1.
- Produces:

```ts
interface PostMediaViewProps {
  media: Pick<PostMedia, "file" | "mediaType">;
  variant: "feed" | "fullscreen";
  onOpen?: () => void;
}

interface MediaLightboxProps {
  isOpen: boolean;
  media: PostMedia[];
  initialIndex: number;
  onClose(): void;
}
```

- [ ] **Step 1: Extend navigation tests**

Add tests for empty input and ordinary movement:

```ts
test("fullscreen navigation advances normally and is safe for empty media", () => {
  assert.equal(getWrappedMediaIndex(1, 1, 5), 2);
  assert.equal(getWrappedMediaIndex(0, 1, 0), 0);
});
```

- [ ] **Step 2: Run focused tests and verify they pass**

Run the Task 1 test command. These characterize the helper contract the viewer
will consume.

- [ ] **Step 3: Extract the shared media renderer**

Move image/video rendering out of `community-post-card.tsx` into
`post-media.tsx`. For feed video, keep native controls and stop click
propagation from the control surface. For fullscreen video, apply contained
viewport sizing and attach a ref supplied internally by the lightbox.

The image surface is a button with `aria-label` when `onOpen` exists. Do not
wrap native video controls in a button. Track image/video load failure locally
and render a stable localized fallback that preserves the slide dimensions and
navigation controls.

- [ ] **Step 4: Implement fullscreen state and lifecycle**

`MediaLightbox` must:

- Reset to `initialIndex` each time it opens.
- Navigate with `getWrappedMediaIndex`.
- Listen for ArrowLeft, ArrowRight, and Escape only while open.
- Respect document direction by mapping visual previous/next consistently.
- Store the previously focused element and restore it on close.
- Focus the dialog close button on open and trap Tab/Shift+Tab within the
  viewer controls until close.
- Lock body scroll while open and restore the previous inline value on cleanup.
- Pause all viewer videos before navigation and on close.
- Track pointer-down coordinates and navigate when horizontal swipe distance is
  at least 50 pixels and exceeds vertical distance.
- Render close, previous, next, counter, and dots with localized labels.
- Use `role="dialog"`, `aria-modal="true"`, and a localized accessible name.

- [ ] **Step 5: Type-check, lint, and commit**

Run:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd features/community/components/post-media.tsx features/community/components/media-lightbox.tsx features/community/utils/community-media-state.ts features/community/utils/community-media-state.test.ts
```

Expected: exit 0.

Commit:

```powershell
git add features/community/components/post-media.tsx features/community/components/media-lightbox.tsx features/community/utils/community-media-state.test.ts
git commit -m "feat: add community media fullscreen viewer"
```

---

### Task 4: Feed Carousel and Post-Card Integration

**Files:**
- Create: `features/community/components/post-media-carousel.tsx`
- Modify: `features/community/components/community-post-card.tsx`
- Modify: `features/community/utils/community-media-state.ts`
- Modify: `features/community/utils/community-media-state.test.ts`

**Interfaces:**
- Consumes `PostMediaView` and `MediaLightbox` from Task 3.
- Produces:

```ts
interface PostMediaCarouselProps {
  media: PostMedia[];
}

export function getNearestSlideIndex(
  scrollLeft: number,
  slideOffsets: readonly number[],
): number;
```

- [ ] **Step 1: Write failing nearest-slide tests**

```ts
test("chooses the nearest snapped slide", () => {
  assert.equal(getNearestSlideIndex(0, [0, 220, 440]), 0);
  assert.equal(getNearestSlideIndex(170, [0, 220, 440]), 1);
  assert.equal(getNearestSlideIndex(390, [0, 220, 440]), 2);
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run the Task 1 test command.

Expected: FAIL because `getNearestSlideIndex` is missing.

- [ ] **Step 3: Implement nearest-slide calculation**

```ts
export function getNearestSlideIndex(
  scrollLeft: number,
  slideOffsets: readonly number[],
) {
  if (slideOffsets.length === 0) return 0;
  return slideOffsets.reduce(
    (best, offset, index) =>
      Math.abs(offset - Math.abs(scrollLeft)) <
      Math.abs(slideOffsets[best] - Math.abs(scrollLeft))
        ? index
        : best,
    0,
  );
}
```

- [ ] **Step 4: Implement the carousel**

For one media item, render one full-width stable-aspect slide with
`PostMediaView`. For two to five items:

```css
--media-gap: 0.75rem;
display: flex;
gap: var(--media-gap);
overflow-x: auto;
scroll-snap-type: x mandatory;
```

Each slide uses:

```css
flex: 0 0 calc((100% - var(--media-gap)) / 1.5);
scroll-snap-align: start;
```

Implementation requirements:

- Keep refs for the rail and each slide.
- Update `activeIndex` on scroll using `requestAnimationFrame` and
  `getNearestSlideIndex`.
- Arrow buttons call `slideRefs[nextIndex].scrollIntoView({ inline: "start" })`.
- Hide previous at logical index 0 and next at the last index.
- Render visible dots and a screen-reader item counter.
- Open `MediaLightbox` with the clicked index.
- Prevent video control clicks from opening the viewer.
- Use logical CSS/DOM direction so RTL scroll remains usable and arrows point in
  the visual direction.
- Use `motion-reduce:scroll-auto` and avoid custom drag code in the feed.

- [ ] **Step 5: Replace grid rendering in the post card**

Delete local `PostMedia`, `MediaRegion`, grid styles, and `ReactNode` import.
Replace the entire media branch with:

```tsx
{post.media.length > 0 && (
  <PostMediaCarousel media={post.media} />
)}
```

Keep author and content links unchanged. Media must no longer be wrapped by the
post-detail `href`.

- [ ] **Step 6: Verify focused tests, types, and lint**

Run:

```powershell
$out = '.tmp-community-media-test'
.\node_modules\.bin\tsc.cmd features/community/utils/community-media-state.ts features/community/utils/community-media-state.test.ts --outDir $out --module commonjs --moduleResolution node --target es2020 --lib es2020,dom --esModuleInterop --skipLibCheck
node --test "$out\community-media-state.test.js"
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd features/community/components/post-media.tsx features/community/components/media-lightbox.tsx features/community/components/post-media-carousel.tsx features/community/components/community-post-card.tsx features/community/utils/community-media-state.ts features/community/utils/community-media-state.test.ts
```

Expected: all tests pass, TypeScript exits 0, and lint has no errors.

- [ ] **Step 7: Remove temporary output and commit**

Use the guarded cleanup from Task 1, then:

```powershell
git add features/community/components/post-media.tsx features/community/components/media-lightbox.tsx features/community/components/post-media-carousel.tsx features/community/components/community-post-card.tsx features/community/utils/community-media-state.ts features/community/utils/community-media-state.test.ts
git commit -m "feat: show community media in carousel"
```

---

### Task 5: Rendered Interaction and Responsive Verification

**Files:**
- Modify only files from Tasks 2–4 when verification finds a concrete defect.
- Do not commit screenshots, traces, temporary scripts, or test media.

**Interfaces:**
- Consumes the complete create, carousel, and lightbox flows.
- Produces browser evidence and a final verified implementation.

- [ ] **Step 1: Run complete static verification**

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\eslint.cmd features/community/components/add-community-post-modal.tsx features/community/components/community-media-picker.tsx features/community/components/post-media.tsx features/community/components/media-lightbox.tsx features/community/components/post-media-carousel.tsx features/community/components/community-post-card.tsx features/community/services/community.service.ts features/community/utils/community-media-state.ts features/community/utils/community-media-state.test.ts
node -e "JSON.parse(require('fs').readFileSync('messages/ar.json','utf8')); JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('locale JSON valid')"
```

Expected: all commands exit 0.

- [ ] **Step 2: Start the application**

Use the configured package manager:

```powershell
npm run dev
```

Verify the exact local URL printed by Next.js. Keep the process in a yielded
cell rather than starting a visible external window.

- [ ] **Step 3: Choose the browser verification path**

The Browser plugin is absent in the current session. Use repository Playwright
if it becomes available. Otherwise use the Vercel agent-browser skill/tooling;
do not install a new browser dependency solely for this task.

Target flow:

`/en/community -> create post -> select mixed media -> uploads complete -> publish -> 1.5-slide carousel -> fullscreen viewer -> arrow navigation`

- [ ] **Step 4: Verify create-post behavior**

At desktop and mobile widths:

- Select two images and two videos together.
- Add two more files and confirm only one is accepted with the five-item toast.
- Confirm all five previews retain selection order.
- Remove one item and confirm another can be added.
- Confirm independent upload progress and retry UI.
- Confirm publish is disabled until all retained items are uploaded.
- Publish and verify the request contains five ordered `media_urls`.

- [ ] **Step 5: Verify carousel behavior**

At desktop and mobile widths:

- Confirm a one-media post is full width.
- Confirm a five-media post shows exactly one full slide plus half of the next.
- Exercise touch/trackpad scrolling and desktop arrows.
- Confirm active dots/counter update after every navigation.
- Confirm the first/last feed arrows disable or hide at boundaries.
- Play a feed video and confirm its controls do not navigate or open fullscreen.
- Repeat in `/ar/community` and verify RTL order and arrows.

- [ ] **Step 6: Verify fullscreen behavior**

- Open the third item and confirm the viewer starts at `3 of 5`.
- Navigate by both arrows and keyboard.
- Swipe at mobile width.
- Confirm navigation wraps at both ends.
- Play a video, navigate away, and confirm it pauses.
- Close with Escape and the close button.
- Confirm focus returns to the media item that opened the viewer.
- Confirm body scrolling is restored.

- [ ] **Step 7: Collect QA evidence**

Confirm:

- Correct page URL/title.
- Meaningful DOM content and no framework overlay.
- No relevant console errors or warnings.
- Desktop and mobile screenshots show the 1.5-slide cue.
- Fullscreen image and video states render within the viewport.

Save temporary screenshots outside the repository and remove temporary scripts
and traces.

- [ ] **Step 8: Run final regression verification**

Repeat Step 1 plus the focused Node tests from Task 4 after any browser-driven
fixes. Run `git diff --check` on every changed community and locale file.

- [ ] **Step 9: Commit verified fixes**

If verification required source changes:

```powershell
git add features/community messages/en.json messages/ar.json
git commit -m "fix: polish community media interactions"
```

If no source changes were required, do not create an empty commit.
