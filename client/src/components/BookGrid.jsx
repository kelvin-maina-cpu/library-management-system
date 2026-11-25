import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiGet, booksQuery } from '../api.js';
import BookCard from './BookCard.jsx';

function Skeleton() {
  return <div className="skeleton-card" aria-hidden="true"><div className="skeleton-cover shimmer" /><div className="skeleton-line shimmer" /><div className="skeleton-line short shimmer" /></div>;
}

export default function BookGrid({ search, genreId }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('title');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError('');
    apiGet(`/books?${booksQuery({ search, genreId })}`, { signal: controller.signal })
      .then((result) => { if (active) setBooks(Array.isArray(result) ? result : (result.data || [])); })
      .catch((reason) => { if (active && reason.name !== 'AbortError') setError(reason.message || 'Books could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [search, genreId, retry]);

  const retryLoad = useCallback(() => setRetry((attempt) => attempt + 1), []);
  const sortedBooks = useMemo(() => [...books].sort((a, b) => {
    const comparison = String(a[sort] || '').localeCompare(String(b[sort] || ''), undefined, { sensitivity: 'base' });
    return comparison || a.id - b.id;
  }), [books, sort]);

  return (
    <div className="results-area">
      <div className="results-toolbar"><p className="results-caption">{loading ? 'Finding books…' : `${books.length} ${books.length === 1 ? 'book' : 'books'} in the collection`}</p>
        <label className="sort-control">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="title">Title</option><option value="author">Author</option></select></label>
      </div>
      {loading ? <div className="book-grid" aria-label="Loading books">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} />)}</div>
        : error ? <div className="state-panel error-panel" role="alert"><span className="state-icon">!</span><h3>We couldn’t load the catalog</h3><p>{error}</p><button className="button-primary" onClick={retryLoad}>Try again</button></div>
          : sortedBooks.length === 0 ? <div className="state-panel"><span className="state-icon">⌕</span><h3>No books found</h3><p>Try another search or choose a different genre.</p></div>
            : <div className="book-grid">{sortedBooks.map((book, index) => <BookCard key={book.id} book={book} index={index} />)}</div>}
    </div>
  );
}
