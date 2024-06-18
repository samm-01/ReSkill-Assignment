'use client'
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query) return;
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`);
      const data = await response.json();
      if (data.items) {
        setBooks(data.items);
      } else {
        setBooks([]);
        setError('No results found.');
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-black bg-opacity-50">
      <h1 className="text-4xl font-bold mb-6 text-white">Google Books Search</h1>
      <div className="flex mb-6 w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-3 flex-grow rounded-l border-t mr-0 border-b border-l text-gray-800 border-gray-200 bg-white"
          placeholder="Search for books by title or author"
        />
        <button
          onClick={handleSearch}
          className="p-3 bg-blue-500 hover:bg-blue-700 text-white rounded-r"
        >
          Search
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white p-4 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
            {book.volumeInfo.imageLinks?.thumbnail && (
              <img
                src={book.volumeInfo.imageLinks.thumbnail}
                alt={`${book.volumeInfo.title} cover`}
                className="w-full h-64 object-cover mb-4 rounded"
              />
            )}
            <h2 className="text-xl font-semibold">{book.volumeInfo.title}</h2>
            <p className="text-gray-700">{book.volumeInfo.authors?.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

