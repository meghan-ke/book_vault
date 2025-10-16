// Manages app state
export let books = [];

export function addBook(book) {
  books.push(book);
}

export function deleteBook(index) {
  books.splice(index, 1);
}

export function setBooks(newBooks) {
  books = [...newBooks];
}

export function getBooks() {
  return books;
}

