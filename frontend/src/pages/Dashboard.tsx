import { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});


interface SearchBooksParams {
  title?: string;
  author?: string;
  subject?: string;
  page?: number;
  limit?: number;
}

export async function searchBooks(params: SearchBooksParams) {
  const response = await api.get('/books', {
    params,
  });

  return response.data;
}
export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    searchBooks({ title: 'flowers', page })
      .then((data) => setBooks(data.items))
      .catch(console.error);
  }, [page]);

  return (
    <div>
      <h1>Books</h1>

      {books.map((book) => (
        <div key={book.id}>
          <h3>{book.title}</h3>
          <img src={book.thumbnail} alt={book.title} />
          <p>{book.authors.join(', ')}</p>
        </div>
      ))}

      <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
        Previous
      </button>

      <button onClick={() => setPage((p) => p + 1)}>
        Next
      </button>
    </div>
  );
}
