import test from 'node:test';
import assert from 'node:assert/strict';

import { renderHtml } from '../.tmp-test-build/ui.js';

test('renderHtml should expose inline feature navigation instead of manager drawer', () => {
  const html = renderHtml('测试项目');

  assert.match(html, /id="featureNav"/);
  assert.match(html, /data-panel="create"/);
  assert.match(html, /data-panel="backup"/);
  assert.match(html, /data-panel="list"/);

  assert.doesNotMatch(html, /id="openManager"/);
  assert.doesNotMatch(html, /id="manager"/);
  assert.doesNotMatch(html, /id="managerMask"/);
});

test('renderHtml should not include popup overlays or browser popup APIs', () => {
  const html = renderHtml('测试项目');

  assert.doesNotMatch(html, /id="randomOverlay"/);
  assert.doesNotMatch(html, /id="confirmOverlay"/);
  assert.doesNotMatch(html, /window\.alert\(/);
  assert.doesNotMatch(html, /window\.prompt\(/);
});

test('renderHtml should include inline strong confirmations for risky actions', () => {
  const html = renderHtml('测试项目');

  assert.match(html, /id="replaceConfirmText"/);
  assert.match(html, /id="undoDelete"/);
});
