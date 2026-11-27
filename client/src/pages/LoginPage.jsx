import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiPost, setSession } from '../api.js';
import Navbar from '../components/Navbar.jsx';
import { useReadingList } from '../context/ReadingListContext.jsx';

function safeRedirect(from) {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
    ? from
    : '/';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mergeGuestList } = useReadingList();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = safeRedirect(location.state?.from);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const session = await apiPost('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });
      setSession(session);
      // Stretch goal: keep books saved before signing in.
      mergeGuestList(session?.user?.id);
      navigate(redirectTo, { replace: true });
    } catch (reason) {
      setError(reason.message || 'Sign in failed. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="site-shell">
      <Navbar />
      <main className="auth-main">
        <section className="auth-card" aria-labelledby="login-heading">
          <p className="eyebrow">WELCOME BACK</p>
          <h1 id="login-heading">Sign in to your library</h1>
          <p className="auth-subtitle">
            Borrow books, save a reading list, and reserve study spaces.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <p className="form-error" role="alert">{error}</p>}

            <label className="form-field" htmlFor="login-email">
              <span>Email</span>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field" htmlFor="login-password">
              <span>Password</span>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <button className="button-primary auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-alt">
            New to Northstar? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </main>
      <footer className="site-footer">
        <span>Northstar Library</span><span>Open a book. Find a world.</span>
      </footer>
    </div>
  );
}
