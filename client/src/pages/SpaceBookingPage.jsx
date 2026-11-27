import { useState } from 'react';
import { apiPost } from '../api.js';
import Navbar from '../components/Navbar.jsx';

const SPACES = [
  { id: 'reading-room-a', name: 'Reading Room A — silent study' },
  { id: 'study-room-b', name: 'Study Room B — group work' },
  { id: 'media-lab', name: 'Media Lab — audio & video' },
  { id: 'quiet-booth', name: 'Quiet Booth — calls & focus' },
];

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export default function SpaceBookingPage() {
  const [form, setForm] = useState({
    spaceId: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const spaceName =
    SPACES.find((space) => space.id === form.spaceId)?.name || '';

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setConfirmation(null);
    setError('');
  }

  function validate() {
    if (!form.spaceId || !form.date || !form.startTime || !form.endTime) {
      return 'Choose a space, a date, and both a start and end time.';
    }
    if (form.date < todayISODate()) {
      return 'Choose today or a future date.';
    }
    if (form.endTime <= form.startTime) {
      return 'The end time must be after the start time.';
    }
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      setConfirmation(null);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const booking = await apiPost(
        '/bookings',
        {
          spaceId: form.spaceId,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
        },
        { auth: true },
      );
      setConfirmation(booking || { ...form });
      setForm({ spaceId: '', date: '', startTime: '', endTime: '' });
    } catch (reason) {
      setError(reason.message || 'The booking could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="site-shell">
      <Navbar />
      <main className="booking-main">
        <section className="booking-card" aria-labelledby="booking-heading">
          <p className="eyebrow">RESERVE A SPACE</p>
          <h1 id="booking-heading">Book a study space</h1>
          <p className="booking-intro">
            Pick a room, choose your day, and tell us when you would like to arrive
            and leave. We will hold the space for your session.
          </p>

          {confirmation && (
            <div className="form-success" role="status">
              <strong>Booking requested.</strong>
              <span>
                {SPACES.find((space) => space.id === confirmation.spaceId)?.name ||
                  spaceName || 'Your space'}
                {confirmation.date ? ` on ${confirmation.date}` : ''}
                {confirmation.startTime && confirmation.endTime
                  ? `, ${confirmation.startTime}–${confirmation.endTime}`
                  : ''}
                .
              </span>
            </div>
          )}

          <form className="booking-form" onSubmit={handleSubmit} noValidate>
            {error && <p className="form-error" role="alert">{error}</p>}

            <label className="form-field" htmlFor="booking-space">
              <span>Space</span>
              <select
                id="booking-space"
                name="spaceId"
                value={form.spaceId}
                onChange={handleChange}
                required
              >
                <option value="">Select a space…</option>
                {SPACES.map((space) => (
                  <option key={space.id} value={space.id}>{space.name}</option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="booking-date">
              <span>Date</span>
              <input
                id="booking-date"
                name="date"
                type="date"
                min={todayISODate()}
                value={form.date}
                onChange={handleChange}
                required
              />
            </label>

            <div className="form-row">
              <label className="form-field" htmlFor="booking-start">
                <span>Start time</span>
                <input
                  id="booking-start"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field" htmlFor="booking-end">
                <span>End time</span>
                <input
                  id="booking-end"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <button
              className="button-primary auth-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Sending request…' : 'Request booking'}
            </button>
          </form>
        </section>
      </main>
      <footer className="site-footer">
        <span>Northstar Library</span><span>Open a book. Find a world.</span>
      </footer>
    </div>
  );
}
