import { getBooks } from './state.js';

export function totalBooks() {
  const books = getBooks() || [];
  return books.length || 0;
}

export function totalPages() {
  const books = getBooks() || [];
  return books.reduce((sum, b) => sum + (Number(b.pages) || 0), 0);
}

export function topTag() {
  const books = getBooks() || [];
  const counts = new Map();
  // normalize tags (trim, collapse multiple spaces) and count
  books.forEach(b => {
    const raw = (b.tag || '').toString().trim();
    if (!raw) return;
    const key = raw.toLowerCase();
    const entry = counts.get(key) || { count: 0, label: raw };
    entry.count += 1;
    // prefer the first-seen label casing
    if (!entry.label) entry.label = raw;
    counts.set(key, entry);
  });
  if (!counts.size) return '-';
  // find the key with max count
  let best = null;
  counts.forEach((v, k) => {
    if (!best || v.count > best.count) best = v;
  });
  return best ? best.label : '-';
}

export function recentBook() {
  const books = getBooks() || [];
  if (!books.length) return '-';
  let latest = null;
  books.forEach(b => {
    // prefer explicit date, then dateAdded, then createdAt
    const raw = b.date || b.dateAdded || b.createdAt || null;
    if (!raw) return;
    const d = new Date(raw);
    if (isNaN(d)) return;
    if (!latest || d > latest.date) latest = { date: d, title: b.title };
  });
  return latest && latest.title ? latest.title : (books[books.length - 1].title || '-');
}



