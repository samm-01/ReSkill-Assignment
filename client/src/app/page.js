'use client'
import { useState, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const maxResults = 12;
  // const cache = {};

  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    setBookmarks(savedBookmarks);
  }, []);

  const handleSearch = async () => {
    if (!query) {
      setError('Please enter a search query.');
      return;
    }

    // const cacheKey = `${query}:${startIndex}`;
    // if (cache[cacheKey]) {
    //   setBooks(cache[cacheKey]);
    //   return;
    // }

    setError(null);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=${maxResults}&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      if (data.items) {
        setBooks(data.items.filter(item => item.volumeInfo.title && item.volumeInfo.authors && item.volumeInfo.imageLinks?.thumbnail));
        cache[cacheKey] = data.items;
      } else {
        setBooks([]);
        setError('No results found.');
      }
    } catch (err) {
      setError('Failed to fetch data.');
    }
  };

  const handleBookmark = (book) => {
    const updatedBookmarks = [...bookmarks, book];
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  };

  const handleRemoveBookmark = (bookId) => {
    const updatedBookmarks = bookmarks.filter(book => book.id !== bookId);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  };

  const handlePreviousPage = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - maxResults);
      handleSearch();
    }
  };

  const handleNextPage = () => {
    setStartIndex(startIndex + maxResults);
    handleSearch();
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-800">
      <h1 className="text-4xl font-bold mb-6 text-gray-200">Books Search</h1>
      <div className="flex mb-6 w-full max-w-md shadow-lg rounded-lg overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-4 flex-grow text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search for books by title or author"
        />
        <button
          onClick={() => {
            setStartIndex(0); // Reset to first page on new search
            handleSearch();
          }}
          className="p-4 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
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
            <h2 className="text-gray-800 text-xl font-semibold">{book.volumeInfo.title}</h2>
            <p className="text-gray-700">{book.volumeInfo.authors?.join(', ')}</p>
            <button
              onClick={() => handleBookmark(book)}
              className="mt-2 p-2 bg-green-500 hover:bg-green-700 text-white rounded"
            >
              Bookmark
            </button>
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-200">My Library</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bookmarks.map((book) => (
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
            <button
              onClick={() => handleRemoveBookmark(book.id)}
              className="mt-2 p-2 bg-red-500 hover:bg-red-700 text-white rounded"
            >
              Remove Bookmark
            </button>
          </div>
        ))}
      </div>
      <div className="flex mt-6">
        <button
          onClick={handlePreviousPage}
          className="p-2 bg-gray-500 hover:bg-gray-700 text-white rounded-l"
          disabled={startIndex === 0}
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded-r ml-2"
          disabled={books.length < maxResults}
        >
          Next
        </button>
      </div>
    </div>
  );
}

