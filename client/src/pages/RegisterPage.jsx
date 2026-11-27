import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost, setSession } from '../api.js';
import Navbar from '../components/Navbar.jsx';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mergeGuestList } = useReadingList();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const session = await apiPost('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSession(session);
      mergeGuestList(session?.user?.id);
      navigate('/', { replace: true });
    } catch (reason) {
      setError(reason.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="site-shell">
      <Navbar />
      <main className="auth-main">
        <section className="auth-card" aria-labelledby="register-heading">
          <p className="eyebrow">JOIN THE LIBRARY</p>
          <h1 id="register-heading">Create your account</h1>
          <p className="auth-subtitle">
            It takes a moment, and your reading list comes with you.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <p className="form-error" role="alert">{error}</p>}

            <label className="form-field" htmlFor="register-name">
              <span>Full name</span>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field" htmlFor="register-email">
              <span>Email</span>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field" htmlFor="register-password">
              <span>Password</span>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
              <small className="form-hint">At least 8 characters.</small>
            </label>

            <button className="button-primary auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="auth-alt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </main>
      <footer className="site-footer">
        <span>Northstar Library</span><span>Open a book. Find a world.</span>
      </footer>
    </div>
  );
}
