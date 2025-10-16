export function validateBook(book) {
  return (
    book.title &&
    book.author &&
    book.pages > 0 &&
    book.date
  );
}
