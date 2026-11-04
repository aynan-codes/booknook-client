export type Book = {
  id: number;
  title: string;
  author: string;
  category: "Fiction" | "Science" | "History" | "Kids" | "Others";
  rating: number;
  description: string;
  isbn: string;
  coverImage: string;
  copies: number;
};

const bookData: [string, string, Book["category"]][] = [
  // তোমার দেওয়া সব bookData entry এখানে একইভাবে থাকবে
];

const isbnMap: Record<string, string> = {
  // তোমার দেওয়া সব ISBN entry এখানে একইভাবে থাকবে
};

export const books: Book[] = bookData.map((book, index) => {
  const [title, author, category] = book;
  const isbn = isbnMap[title] || "";

  return {
    id: index + 1,
    title,
    author,
    category,
    rating: Number((4.6 + (index % 4) * 0.1).toFixed(1)),
    description: `${title} by ${author}. Discover this book in our ${category} collection.`,
    isbn,
    coverImage: isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
      : "",
    copies: (index % 7) + 1,
  };
});