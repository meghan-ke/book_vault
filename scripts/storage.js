import { setBooks, getBooks } from './state.js';

export async function loadSeed() {
  try {
    const response = await fetch('seed.json');
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data)) {
      // normalize incoming book objects to ensure a `date` property (YYYY-MM-DD)
      const normalized = data.map(b => {
        const date = b.date || b.dateAdded || (b.createdAt ? String(b.createdAt).split('T')[0] : undefined);
        return { ...b, date };
      });
  setBooks(normalized);
  console.log('Books loaded:', normalized.length);

  // ui.js will call updateStats() after awaiting loadSeed();
  document.getElementById('total-books').textContent = normalized.length;
    }
  } catch {
    // More verbose error logging to help debug fetch issues (e.g. file:// blocking)
    console.warn('No seed file found or fetch failed. If you opened the page via file:// the browser may block fetch().', arguments[0]);
    // fallback: support embedding the seed JSON into the page via a global variable
    try {
      if (typeof window !== 'undefined' && Array.isArray(window.__BV_SEED)) {
        const normalized = window.__BV_SEED.map(b => ({ ...b, date: b.date || b.dateAdded || (b.createdAt ? String(b.createdAt).split('T')[0] : undefined) }));
        setBooks(normalized);
        const el = document.getElementById('total-books');
        if (el) el.textContent = normalized.length;
      }
    } catch (e) {
      console.warn('Fallback seed load failed', e);
    }
  }
}

export function exportBooks() {
  const blob = new Blob([JSON.stringify(getBooks(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'books.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importBooks(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data)) {
        const normalized = data.map(b => {
          const date = b.date || b.dateAdded || (b.createdAt ? String(b.createdAt).split('T')[0] : undefined);
          return { ...b, date };
        });
        setBooks(normalized);
        callback(true);
      } else callback(false);
    } catch {
      callback(false);
    }
  };
  reader.readAsText(file);
}
