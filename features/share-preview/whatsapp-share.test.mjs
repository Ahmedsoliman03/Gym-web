import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

async function loadModule() {
  const source = await readFile(new URL('./whatsapp-share.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });

  return import(`data:text/javascript,${encodeURIComponent(outputText)}`);
}

test('buildWhatsAppShareUrl encodes a message and link for wa.me sharing', async () => {
  const { buildWhatsAppShareUrl } = await loadModule();

  assert.equal(
    buildWhatsAppShareUrl({
      url: 'https://gymspot.app/en/jobs/42?ref=coach',
      message: 'Elite Coach Role',
    }),
    'https://wa.me/?text=Elite%20Coach%20Role%0Ahttps%3A%2F%2Fgymspot.app%2Fen%2Fjobs%2F42%3Fref%3Dcoach',
  );
});

test('getDefaultWhatsAppShareMessage returns localized fallback copy by content type', async () => {
  const { getDefaultWhatsAppShareMessage } = await loadModule();

  assert.equal(getDefaultWhatsAppShareMessage('coach', 'en'), 'Check out this coach on GymSpot');
  assert.equal(getDefaultWhatsAppShareMessage('gym', 'ar'), 'شاهد هذا الجيم على GymSpot');
});
