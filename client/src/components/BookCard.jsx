import { Link } from 'react-router-dom';

const palettes = ['cover-rust', 'cover-olive', 'cover-blue', 'cover-plum', 'cover-gold'];

export default function BookCard({ book, index = 0 }) {
  const initials = book.title.split(/\s+/).slice(0, 2).map((part) => part[0]).join('');
  return (
    <article className="book-card">
      <Link className={`book-cover ${palettes[index % palettes.length]}`} to={`/books/${book.id}`} aria-label={`View ${book.title}`}>
        <span className="cover-rule" />
        <span className="cover-initials" aria-hidden="true">{initials}</span>
        <span className="cover-title">{book.title}</span>
        <span className="cover-author">{book.author}</span>
        <span className="cover-bottom" aria-hidden="true">✳</span>
      </Link>
      <div className="book-card-info">
        <span className="book-genre">{book.genre?.name || 'Uncategorized'}</span>
        <h3><Link to={`/books/${book.id}`}>{book.title}</Link></h3>
        <p>{book.author}</p>
        <Link className="details-link" to={`/books/${book.id}`}>View details <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}
