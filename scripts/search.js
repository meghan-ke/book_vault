import { getBooks } from './state.js';

function escapeRegExp(str) {
  // Escape special characters for literal match in RegExp
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function searchBooks(query) {
  const q = String(query || '').trim();
  if (!q) return getBooks();
  try {
    const regex = new RegExp(escapeRegExp(q), 'i');
    return getBooks().filter(b => {
      const title = b.title || '';
      const author = b.author || '';
      const tag = b.tag || '';
      return regex.test(title) || regex.test(author) || regex.test(tag);
    });
  } catch (err) {
    // on any unexpected error, return empty result set
    console.warn('searchBooks error:', err);
    return [];
  }
}
