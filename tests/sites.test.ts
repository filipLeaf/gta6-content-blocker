import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findSite } from '../src/content/sites.ts';

test('findSite matches domains and subdomains only', () => {
  assert.equal(findSite('www.youtube.com')?.id, 'youtube');
  assert.equal(findSite('m.youtube.com')?.id, 'youtube');
  assert.equal(findSite('x.com')?.id, 'x');
  assert.equal(findSite('mobile.twitter.com')?.id, 'x');
  assert.equal(findSite('old.reddit.com')?.id, 'reddit');
  assert.equal(findSite('notyoutube.com'), null);
  assert.equal(findSite('example.com'), null);
});
