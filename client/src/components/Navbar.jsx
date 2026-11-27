import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getStoredUser, getToken } from '../api.js';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function Navbar() {
  const navigate = useNavigate();
  const { count, switchUser } = useReadingList();
  const signedIn = Boolean(getToken());
  const user = getStoredUser();

  function handleSignOut() {
    clearSession();
    switchUser(null);
    navigate('/');
  }

  return (
    <header className="site-header app-navbar">
      <Link className="brand" to="/" aria-label="Open library catalog">
        <span className="brand-mark" aria-hidden="true">✦</span>
        <span>Northstar <span className="brand-light">Library</span></span>
      </Link>

      <nav className="navbar-links" aria-label="Main navigation">
        <Link className="navbar-link" to="/">Catalog</Link>
        <span
          className="reading-list-pill"
          aria-label={`${count} ${count === 1 ? 'book' : 'books'} in your reading list`}
        >
          <span aria-hidden="true">✧</span>
          Reading list
          <span className="reading-list-count">{count}</span>
        </span>
        <Link className="navbar-link" to="/booking">Book a space</Link>

        {signedIn ? (
          <>
            <span className="navbar-user" title={user?.email || undefined}>
              {user?.name || user?.email || 'Signed in'}
            </span>
            <button type="button" className="navbar-signout" onClick={handleSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <Link className="navbar-link navbar-signin" to="/login">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
