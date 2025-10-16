import { getBooks } from './state.js';

export function searchBooks(query) {
  const q = query.trim();
  if (!q) return getBooks();
  try {
    const regex = new RegExp(q, 'i');
    return getBooks().filter(b =>
      regex.test(b.title) || regex.test(b.author) || regex.test(b.tag)
    );
  } catch {
    return [];
  }
}
