import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value.trim()), 350);
    return () => clearTimeout(timeout);
  }, [value, onSearch]);

  return (
    <label className="search-field">
      <span className="sr-only">Search by book title or author</span>
      <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
      <input type="search" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search title or author..." />
    </label>
  );
}
