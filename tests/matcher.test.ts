import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMatcher, normalize } from '../src/content/matcher.ts';

const strict = createMatcher({ mode: 'strict' });
const spoilersOnly = createMatcher({ mode: 'spoilers' });

test('normalize handles case, punctuation and accents', () => {
  assert.equal(normalize("GTA-VI's ENDING!!"), 'gta vi s ending');
  assert.equal(normalize('Lucía   Camínos'), 'lucia caminos');
  assert.equal(normalize('#GTA6'), 'gta6');
  assert.equal(normalize(null), '');
});

test('strict mode catches the common ways people write GTA VI', () => {
  for (const title of [
    'GTA 6 trailer 3 breakdown',
    'gta6 is finally here',
    'GTA VI: everything we know',
    'GTAVI gameplay',
    'Grand Theft Auto VI review',
    'Grand Theft Auto 6 PC port?',
    '#GTA6 hype',
    'Exploring Vice City at night',
    'The map of Leonida is huge',
    "Jason Duval's backstory",
    'Lucia Caminos fan art',
  ]) {
    assert.ok(strict(title), `should block: ${title}`);
  }
});

test('context prefixes catch subreddit names and hashtags', () => {
  for (const text of [
    'r/GTA6unmoderated Props to Rockstar for making the game so realistic',
    'Posted in r/GTA6News',
    '#GTA6Trailer3 is coming',
    'r/GTAVIleaks',
  ]) {
    assert.ok(strict(text), `should block: ${text}`);
  }
  for (const text of ['r/GTA5mods new update', 'xgta6 is not a prefix match', 'gta 5 vi']) {
    assert.equal(strict(text), null, `should not block: ${text}`);
  }
});

test('strict mode blocks two different weak terms together', () => {
  assert.ok(strict('Jason and Lucia finally meet'));
});

test('no false positives on common names and unrelated text', () => {
  for (const text of [
    'Jason Momoa visits Miami',
    'Lucia sings at the festival',
    'Jason Jason Jason', // the same weak term repeated is still one term
    'GTA 5 online heist guide',
    'Grand Theft Auto V speedrun',
    'Advice: city life vs suburbs', // "vice city" must not match inside "advice city"
    'Top 10 PS5 games',
    '',
  ]) {
    assert.equal(strict(text), null, `should not block: ${text}`);
  }
});

test('spoilers mode needs GTA context AND a spoiler word', () => {
  assert.ok(spoilersOnly('GTA 6 ending explained'));
  assert.ok(spoilersOnly('GTA VI final mission spoilers'));
  assert.ok(spoilersOnly('Jason and Lucia betrayal twist'));
  assert.equal(spoilersOnly('GTA 6 pre-order bonuses'), null);
  assert.equal(spoilersOnly('GTA 6 trailer reaction'), null);
  assert.equal(spoilersOnly('Elden Ring ending explained'), null);
});

test('custom terms always block, in every mode', () => {
  const match = createMatcher({ mode: 'spoilers', customTerms: ['Big Twist Guy', 'Cal'] });
  assert.ok(match('who is big twist guy'));
  assert.ok(match('Cal is the best'));
  assert.equal(match('calendar app'), null);
});

test('whitelist terms win over everything', () => {
  const match = createMatcher({ mode: 'strict', whitelistTerms: ['official trailer'] });
  assert.equal(match('GTA 6 Official Trailer'), null);
  assert.ok(match('GTA 6 leaked footage'));
});

test('empty or missing settings fall back to strict', () => {
  assert.ok(createMatcher()('gta 6'));
  assert.ok(createMatcher({ customTerms: [], whitelistTerms: ['', '  '] })('gta 6'));
});
