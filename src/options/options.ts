import type { Settings } from '../shared/types.ts';
import { getSettings, setSettings } from '../shared/storage.ts';

type ListKey = 'customTerms' | 'whitelistTerms';

const customForm = document.querySelector<HTMLFormElement>('#custom-form')!;
const customInput = document.querySelector<HTMLInputElement>('#custom-input')!;
const customList = document.querySelector<HTMLUListElement>('#custom-list')!;

const whitelistForm = document.querySelector<HTMLFormElement>('#whitelist-form')!;
const whitelistInput = document.querySelector<HTMLInputElement>('#whitelist-input')!;
const whitelistList = document.querySelector<HTMLUListElement>('#whitelist-list')!;

let settings: Settings;

function renderList(list: HTMLUListElement, terms: string[], onRemove: (term: string) => void): void {
  list.replaceChildren(); // clear old items

  if (terms.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No words yet.';
    list.append(empty);
    return;
  }

  for (const term of terms) {
    const item = document.createElement('li');

    const label = document.createElement('span');
    label.textContent = term;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove ${term}`);
    remove.addEventListener('click', () => onRemove(term));

    item.append(label, remove);
    list.append(item);
  }
}

function render(): void {
  renderList(customList, settings.customTerms, (term) => removeTerm('customTerms', term));
  renderList(whitelistList, settings.whitelistTerms, (term) => removeTerm('whitelistTerms', term));
}

function saveTerms(key: ListKey, terms: string[]): void {
  settings = { ...settings, [key]: terms };
  render();
  void setSettings({ [key]: terms });
}

function addTerm(key: ListKey, input: HTMLInputElement): void {
  const term = input.value.trim();
  input.value = '';
  if (!term) return;

  const exists = settings[key].some((t) => t.toLowerCase() === term.toLowerCase());
  if (!exists) saveTerms(key, [...settings[key], term]);
}

function removeTerm(key: ListKey, term: string): void {
  saveTerms(key, settings[key].filter((t) => t !== term));
}

async function main(): Promise<void> {
  settings = await getSettings();
  render();

  customForm.addEventListener('submit', (event) => {
    event.preventDefault(); // stay on the page instead of submitting the form
    addTerm('customTerms', customInput);
  });

  whitelistForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addTerm('whitelistTerms', whitelistInput);
  });
}

main();
