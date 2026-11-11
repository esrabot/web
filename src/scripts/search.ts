/**
 * Site search, in the browser.
 *
 * One script drives every search box on the page: the dialog that opens
 * from the header (or with Ctrl/⌘ K, or "/"), and the box on /search.
 * Both read the same index, /search-index.json, fetched once on first use.
 *
 * Matching is small and predictable rather than clever:
 *
 *   - every word typed must match the entry somewhere;
 *   - a match in the title outranks one in the description, which
 *     outranks one in the hidden body text;
 *   - a word of four letters or more may be one typo away from a word in
 *     the title, so "projcts" still finds the projects.
 *
 * Results are built as DOM nodes with textContent, never as HTML strings,
 * so nothing from the index or the query is ever parsed as markup.
 */

interface Entry {
  t: string;
  u: string;
  k: string;
  d: string;
  w: string;
  x?: true;
}

interface Prepared extends Entry {
  /** Normalised title, description, extra words and kind. */
  nt: string;
  nd: string;
  nw: string;
  nk: string;
  /** The title's words. */
  tw: string[];
}

/** Tie-break order between kinds. Mirrors SEARCH_KINDS in lib/search-index.ts. */
const KIND_ORDER = ['Page', 'Project', 'Event', 'Guide', 'Member', 'Partner', 'Repository'];

const MAX_TOKENS = 8;

/** Lowercase, and fold accents, so "resume" finds "résumé". */
function norm(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function prepare(entries: Entry[]): Prepared[] {
  return entries.map((entry) => {
    const nt = norm(entry.t);
    return {
      ...entry,
      nt,
      nd: norm(entry.d),
      nw: norm(entry.w),
      nk: entry.k.toLowerCase(),
      tw: nt.split(/[^a-z0-9]+/).filter(Boolean),
    };
  });
}

/** True when two strings are at most one insertion, deletion or swap apart. */
function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;

  let i = 0;
  while (i < la && i < lb && a[i] === b[i]) i++;

  // Same length: one substitution, or two neighbours transposed.
  if (la === lb) {
    if (a.slice(i + 1) === b.slice(i + 1)) return true;
    return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2);
  }

  // One longer than the other: a single dropped or added letter.
  return la > lb ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

/** Does `token` nearly match the start of `word`? */
function nearPrefix(word: string, token: string): boolean {
  const n = token.length;
  return (
    withinOneEdit(word.slice(0, n), token) ||
    withinOneEdit(word.slice(0, n + 1), token) ||
    (n > 1 && withinOneEdit(word.slice(0, n - 1), token))
  );
}

function scoreEntry(entry: Prepared, tokens: string[]): number {
  let total = 0;

  for (const token of tokens) {
    let score = 0;

    if (entry.nt === token) score = 120;
    else if (entry.nt.startsWith(token)) score = 80;
    else if (entry.tw.some((word) => word.startsWith(token))) score = 60;
    else if (entry.nt.includes(token)) score = 40;
    else if (token.length > 2 && (entry.nk.startsWith(token) || token.startsWith(entry.nk)))
      score = 24;
    else if (entry.nd.includes(token)) score = 16;
    else if (entry.nw.includes(token)) score = 8;
    else if (token.length >= 4 && entry.tw.some((word) => nearPrefix(word, token))) score = 20;

    // Every word typed has to find something.
    if (score === 0) return 0;
    total += score;
  }

  return total;
}

function search(index: Prepared[], query: string): Prepared[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean).slice(0, MAX_TOKENS);
  if (tokens.length === 0) return [];

  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
    .filter((hit) => hit.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        KIND_ORDER.indexOf(a.entry.k) - KIND_ORDER.indexOf(b.entry.k) ||
        a.entry.t.localeCompare(b.entry.t)
    )
    .map((hit) => hit.entry);
}

/** The title as nodes, with the matched runs wrapped in <mark>. */
function highlight(title: string, query: string): Node[] {
  const lower = title.toLowerCase();
  // Case-folding can change a string's length in a few scripts; the
  // offsets would no longer line up, so leave such titles plain.
  if (lower.length !== title.length) return [document.createTextNode(title)];

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, MAX_TOKENS);
  const ranges: [number, number][] = [];
  for (const token of tokens) {
    let from = lower.indexOf(token);
    while (from !== -1) {
      ranges.push([from, from + token.length]);
      from = lower.indexOf(token, from + token.length);
    }
  }
  if (ranges.length === 0) return [document.createTextNode(title)];

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }

  const nodes: Node[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) nodes.push(document.createTextNode(title.slice(cursor, start)));
    const mark = document.createElement('mark');
    mark.textContent = title.slice(start, end);
    nodes.push(mark);
    cursor = end;
  }
  if (cursor < title.length) nodes.push(document.createTextNode(title.slice(cursor)));
  return nodes;
}

function el(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function resultItem(entry: Prepared, query: string): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'search-result';

  const link = document.createElement('a');
  link.href = entry.u;
  if (entry.x) {
    link.target = '_blank';
    link.rel = 'noopener';
  }

  const text = el('span', 'sr-text');
  const title = el('span', 'sr-title');
  title.append(...highlight(entry.t, query));
  text.append(title);
  if (entry.d) text.append(el('span', 'sr-desc', entry.d));

  const go = el('span', 'sr-go', entry.x ? '↗' : '→');
  go.setAttribute('aria-hidden', 'true');

  link.append(el('span', 'sr-kind', entry.k), text, go);
  if (entry.x) link.append(el('span', 'sr-only', '(opens in a new tab)'));

  item.append(link);
  return item;
}

/* ------------------------------------------------------------------
 * The index: fetched once, on first use, and shared by every box.
 * ---------------------------------------------------------------- */
let indexPromise: Promise<Prepared[]> | null = null;

function loadIndex(url: string): Promise<Prepared[]> {
  indexPromise ??= fetch(url, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`search index: ${response.status}`);
      return response.json() as Promise<Entry[]>;
    })
    .then(prepare)
    .catch((error) => {
      // Let the next keystroke try again rather than caching a failure.
      indexPromise = null;
      throw error;
    });
  return indexPromise;
}

/* ------------------------------------------------------------------
 * One search box
 * ---------------------------------------------------------------- */
interface Mounted {
  input: HTMLInputElement;
  warm: () => void;
}

function mount(root: HTMLElement): Mounted | null {
  const input = root.querySelector<HTMLInputElement>('[data-search-input]');
  const form = root.querySelector<HTMLFormElement>('[data-search-form]');
  const list = root.querySelector<HTMLElement>('[data-search-results]');
  const status = root.querySelector<HTMLElement>('[data-search-status]');
  const idle = root.querySelector<HTMLElement>('[data-search-idle]');
  const empty = root.querySelector<HTMLElement>('[data-search-empty]');
  const term = root.querySelector<HTMLElement>('[data-search-term]');
  const failed = root.querySelector<HTMLElement>('[data-search-failed]');
  const indexUrl = root.dataset.indexUrl;
  if (!input || !list || !indexUrl) return null;

  const limit = Number(root.dataset.limit) || 8;
  const syncUrl = root.hasAttribute('data-search-sync');

  let active = -1;
  let run = 0;

  const links = () => Array.from(list.querySelectorAll<HTMLAnchorElement>('.search-result a'));

  function setActive(next: number, reveal = false) {
    const items = Array.from(list!.children);
    active = items.length === 0 ? -1 : (next + items.length) % items.length;
    items.forEach((item, i) => item.classList.toggle('active', i === active));
    if (reveal && active >= 0) items[active]!.scrollIntoView({ block: 'nearest' });
  }

  function show(state: 'idle' | 'results' | 'empty' | 'failed') {
    list!.hidden = state !== 'results';
    if (empty) empty.hidden = state !== 'empty';
    if (failed) failed.hidden = state !== 'failed';
    // The suggestions stay under "no results" as somewhere to go next.
    if (idle) idle.hidden = state === 'results' || state === 'failed';
    root.dataset.state = state;
  }

  async function update() {
    const query = input!.value.trim();
    const mine = ++run;

    if (syncUrl) {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
      history.replaceState(history.state, '', url);
    }

    if (!query) {
      list!.replaceChildren();
      active = -1;
      if (status) status.textContent = '';
      show('idle');
      return;
    }

    let index: Prepared[];
    try {
      index = await loadIndex(indexUrl!);
    } catch {
      if (mine !== run) return;
      list!.replaceChildren();
      active = -1;
      if (status) status.textContent = 'Search is unavailable right now.';
      show('failed');
      return;
    }
    // A newer keystroke has already superseded this one.
    if (mine !== run) return;

    const all = search(index, query);
    const shown = all.slice(0, limit);

    list!.replaceChildren(...shown.map((entry) => resultItem(entry, query)));
    list!.scrollTop = 0;

    if (shown.length === 0) {
      active = -1;
      if (term) term.textContent = query;
      if (status) status.textContent = `No results for ${query}.`;
      show('empty');
      return;
    }

    if (status) {
      status.textContent =
        all.length > shown.length
          ? `Showing the top ${shown.length} of ${all.length} results.`
          : `${shown.length} ${shown.length === 1 ? 'result' : 'results'}.`;
    }
    show('results');
    setActive(0);
  }

  input.addEventListener('input', update);

  // The dialog this box sits in, if any.
  const owner = root.closest('dialog');

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && owner?.open) {
      // A search field's own Esc only empties it, and swallows the key, so
      // a dialog with something typed would take two presses to close.
      event.preventDefault();
      owner.close();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (list.children.length === 0) return;
      event.preventDefault();
      setActive(active + (event.key === 'ArrowDown' ? 1 : -1), true);
    } else if (event.key === 'Enter') {
      // Open the highlighted result; never submit the form from here.
      event.preventDefault();
      links()[active]?.click();
    }
  });

  // With JS the box answers as you type, so a submit has nothing to do.
  form?.addEventListener('submit', (event) => event.preventDefault());

  // Pointer and keyboard agree on which result is current.
  list.addEventListener('pointermove', (event) => {
    const item = (event.target as Element).closest('.search-result');
    if (!item) return;
    const i = Array.from(list.children).indexOf(item);
    if (i !== active) setActive(i);
  });

  if (syncUrl) {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) {
      input.value = initial;
      void update();
    }
  }

  return {
    input,
    warm: () => {
      loadIndex(indexUrl).catch(() => {});
    },
  };
}

/* ------------------------------------------------------------------
 * Wiring: every box on the page, the dialog, and the shortcuts
 * ---------------------------------------------------------------- */
const dialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
let dialogBox: Mounted | null = null;
let pageBox: Mounted | null = null;

document.querySelectorAll<HTMLElement>('[data-search-root]').forEach((root) => {
  const mounted = mount(root);
  if (!mounted) return;
  if (dialog?.contains(root)) dialogBox = mounted;
  else pageBox = mounted;
});

function focusBox(box: Mounted) {
  box.warm();
  box.input.focus();
  box.input.select();
}

function openSearch() {
  // On /search itself the page's own box is the search; use it.
  if (pageBox) {
    focusBox(pageBox);
    return;
  }
  if (!dialog || !dialogBox) return;
  // Fold the mobile menu away first, so it is not left open underneath.
  document.querySelector('[data-header]')?.removeAttribute('data-open');
  document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false');
  if (!dialog.open) dialog.showModal();
  focusBox(dialogBox);
}

if (dialogBox || pageBox) {
  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element).closest('[data-search-open]');
    if (!trigger) return;
    // Leave modified clicks alone: the link still opens /search in a new tab.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    openSearch();
  });

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    // Autofill can dispatch key events that carry no key at all.
    const key = (event.key ?? '').toLowerCase();

    if (key === 'k' && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
      event.preventDefault();
      if (dialog?.open) dialog.close();
      else openSearch();
      return;
    }

    if (key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName ?? ''));
      // Not while typing, and not over another open dialog.
      if (typing || document.querySelector('dialog[open]')) return;
      event.preventDefault();
      openSearch();
    }
  });

  // A result that points at this same page (an in-page anchor) does not
  // unload it, so the dialog has to step aside by itself.
  dialog?.addEventListener('click', (event) => {
    if ((event.target as Element).closest('.search-result a, .search-jump a')) dialog.close();
  });

  // Show the shortcut the visitor's own keyboard has.
  if (/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)) {
    document.querySelectorAll('[data-search-kbd]').forEach((kbd) => {
      kbd.textContent = '⌘K';
    });
  }
}
