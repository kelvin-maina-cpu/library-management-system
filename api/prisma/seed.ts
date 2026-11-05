import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalog: Record<string, { description: string; books: [string, string, string, number][] }> = {
  'Science Fiction': {
    description: 'Speculative fiction about science and the future.',
    books: [
      ['Dune', 'Frank Herbert', '978-0-00-000001-1', 1965],
      ['Neuromancer', 'William Gibson', '978-0-00-000002-2', 1984],
      ['The Left Hand of Darkness', 'Ursula K. Le Guin', '978-0-00-000003-3', 1969],
      ['Foundation', 'Isaac Asimov', '978-0-00-000004-4', 1951],
    ],
  },
  Fantasy: {
    description: 'Stories set in magical or imaginary worlds.',
    books: [
      ['The Hobbit', 'J.R.R. Tolkien', '978-0-00-000005-5', 1937],
      ['A Wizard of Earthsea', 'Ursula K. Le Guin', '978-0-00-000006-6', 1968],
      ['The Name of the Wind', 'Patrick Rothfuss', '978-0-00-000007-7', 2007],
      ['Mistborn', 'Brandon Sanderson', '978-0-00-000008-8', 2006],
    ],
  },
  Mystery: {
    description: 'Crime, detection and suspense.',
    books: [
      ['And Then There Were None', 'Agatha Christie', '978-0-00-000009-9', 1939],
      ['The Hound of the Baskervilles', 'Arthur Conan Doyle', '978-0-00-000010-0', 1902],
      ['The Big Sleep', 'Raymond Chandler', '978-0-00-000011-1', 1939],
      ['Gone Girl', 'Gillian Flynn', '978-0-00-000012-2', 2012],
    ],
  },
  'Non-Fiction': {
    description: 'Factual books on history, science and society.',
    books: [
      ['Sapiens', 'Yuval Noah Harari', '978-0-00-000013-3', 2011],
      ['A Brief History of Time', 'Stephen Hawking', '978-0-00-000014-4', 1988],
      ['The Selfish Gene', 'Richard Dawkins', '978-0-00-000015-5', 1976],
      ['Educated', 'Tara Westover', '978-0-00-000016-6', 2018],
    ],
  },
};

async function main() {
  for (const [name, { description, books }] of Object.entries(catalog)) {
    const genre = await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name, description },
    });

    for (const [title, author, isbn, publishedYear] of books) {
      await prisma.book.upsert({
        where: { isbn },
        update: {},
        create: { title, author, isbn, publishedYear, copiesAvailable: 3, genreId: genre.id },
      });
    }
  }

  await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: {},
    create: { email: 'librarian@example.com', name: 'Head Librarian', role: 'LIBRARIAN' },
  });

  console.log(`Seeded ${await prisma.genre.count()} genres and ${await prisma.book.count()} books.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());