import { getBooks } from './state.js';

export function totalBooks() {
  return getBooks().length;
}

export function totalPages() {
  return getBooks().reduce((sum, b) => sum + (Number(b.pages) || 0), 0);
}

export function topTag() {
  const tagCounts = {};
  getBooks().forEach(b => {
    tagCounts[b.tag] = (tagCounts[b.tag] || 0) + 1;
  });
  return Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])[0] || '-';
}

export function recentBook() {
  const books = getBooks();
  return books.length ? books[books.length - 1].title : '-';
}



