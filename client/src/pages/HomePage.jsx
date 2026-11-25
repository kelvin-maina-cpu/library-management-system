import { useEffect, useState } from 'react';
import { apiGet } from '../api.js';
import BookGrid from '../components/BookGrid.jsx';
import GenreFilter from '../components/GenreFilter.jsx';
import SearchBar from '../components/SearchBar.jsx';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [genres, setGenres] = useState([]);
  const [genreError, setGenreError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    apiGet('/genres', { signal: controller.signal })
      .then(setGenres)
      .catch((error) => {
        if (error.name !== 'AbortError') setGenreError('Genres could not be loaded.');
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Open library catalog">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>Northstar <span className="brand-light">Library</span></span>
        </a>
        <span className="header-note">A place for curious minds</span>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">THE COLLECTION</p>
            <h1>Find your next<br /><em>great read.</em></h1>
            <p className="hero-description">Explore stories, ideas, and new worlds from our library shelves.</p>
          </div>
          <div className="hero-decoration" aria-hidden="true"><span>✳</span><span>✦</span><span>✧</span></div>
        </section>

        <section className="catalog-section" aria-labelledby="catalog-heading">
          <div className="catalog-heading-row">
            <div><p className="eyebrow">BROWSE</p><h2 id="catalog-heading">Library catalog</h2></div>
            <p className="catalog-intro">Good books make good company.</p>
          </div>
          <div className="catalog-controls">
            <SearchBar onSearch={setSearch} />
            <GenreFilter genres={genres} value={genreId} onChange={setGenreId} error={genreError} />
          </div>
          <BookGrid search={search} genreId={genreId} />
        </section>
      </main>
      <footer className="site-footer"><span>Northstar Library</span><span>Open a book. Find a world.</span></footer>
    </div>
  );
}
