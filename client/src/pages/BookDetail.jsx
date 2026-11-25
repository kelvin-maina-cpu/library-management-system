import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../api.js';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    apiGet(`/books/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(setBook)
      .catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  return <div className="site-shell detail-shell">
    <header className="site-header"><Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">✦</span><span>Northstar <span className="brand-light">Library</span></span></Link><Link className="header-back" to="/">← Catalog</Link></header>
    <main className="detail-main">
      <Link className="back-link" to="/">← Back to catalog</Link>
      {loading ? <div className="detail-loading"><div className="skeleton-cover shimmer" /><div><div className="skeleton-line shimmer" /><div className="skeleton-line short shimmer" /></div></div>
        : error ? <div className="state-panel error-panel" role="alert"><span className="state-icon">!</span><h2>{error.includes('404') || error.toLowerCase().includes('not found') ? 'Book not found' : 'Book details are unavailable'}</h2><p>{error}</p><Link className="button-primary" to="/">Return to catalog</Link></div>
          : book && <article className="detail-layout">
            <div className="detail-cover"><div className="book-cover cover-blue"><span className="cover-rule"/><span className="cover-initials" aria-hidden="true">{book.title.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}</span><span className="cover-title">{book.title}</span><span className="cover-author">{book.author}</span><span className="cover-bottom" aria-hidden="true">✳</span></div></div>
            <div className="detail-copy"><p className="eyebrow">BOOK DETAILS</p><p className="detail-genre">{book.genre?.name || 'Uncategorized'}</p><h1>{book.title}</h1><p className="detail-author">by {book.author}</p>
              <div className="detail-divider"/><dl className="book-facts">
                <div><dt>ISBN</dt><dd>{book.isbn}</dd></div>
                {book.publishedYear != null && <div><dt>Published</dt><dd>{book.publishedYear}</dd></div>}
                <div><dt>Copies in collection</dt><dd>{book.totalCopies} {book.totalCopies === 1 ? 'copy' : 'copies'}</dd></div>
                {book.genre?.description && <div className="genre-description"><dt>About this genre</dt><dd>{book.genre.description}</dd></div>}
              </dl>
              <p className="availability"><span className="availability-dot"/> Listed in the library collection</p>
            </div>
          </article>}
    </main>
    <footer className="site-footer"><span>Northstar Library</span><span>Open a book. Find a world.</span></footer>
  </div>;
}
