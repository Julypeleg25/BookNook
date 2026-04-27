import { GenreOptions, languageMenuItems } from "@components/searchFilters/models/SearchFiltersOptions";
import type { Book, BookPost, PostComment } from "@models/Book";
import { faker } from "@faker-js/faker";
import type { User } from "@models/User";

const randomItems = <T>(arr: T[], min = 1, max = 3): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
};

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const users: User[] = [
  {
    id: "u1",
    username: "julydev",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "u2",
    username: "booklover",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "u3",
    username: "reading_addict",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: "u4",
    username: "nightreader",
    avatar: "https://i.pravatar.cc/150?img=56",
  },
];

const postDescriptions = Array.from({ length: 9 }, () =>
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n")
);

const commentContents = [
  Array.from({ length: 1 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n")
    .repeat(2),
];

// Note: Book matches the updated Book interface which allows optional fields
const books: Book[] = Array.from({ length: 200 }, (_, i) => ({
  id: `b${i + 1}`,
  title: faker.book.title(),
  authors: [faker.person.fullName()], // Array of strings
  description: faker.lorem.paragraph(),
  thumbnail: `https://picsum.photos/300/450?random=book-${i + 1}`,
  publishedDate: faker.date.past({ years: 30 }).toISOString(),
  genres: randomItems(Object.values(GenreOptions), 1, 3),
}));

const bookPosts: BookPost[] = Array.from({ length: 40 }, (_, i) => {
  const book = randomItem(books);
  const user = randomItem(users);
  const createdDate = new Date(
    Date.now() - Math.floor(Math.random() * 100000000)
  ).toISOString();
  
  const likesCount = Math.floor(Math.random() * 100);
  // Generate array of fake user IDs for likes
  const likes: string[] = Array.from({ length: likesCount }, (_, k) => `u${k}`);
  
  const rating = Math.floor(Math.random() * 5) + 1;

  const comments: PostComment[] = Array.from(
    { length: Math.floor(Math.random() * 20) },
    (_, j) => {
      const commentUser = randomItem(users);
      const commentDate = new Date(Date.now() - Math.floor(Math.random() * 10000000));
      return {
        id: `c${i}-${j}`,
        user: commentUser,
        createdDate: commentDate.toISOString(),
        // bookPost will be attached below to avoid circular dependency in const definition
        content: randomItem(commentContents),
      };
    }
  );

  const post: BookPost = {
    id: `p${i + 1}`,
    book,
    user,
    createdDate,
    description: randomItem(postDescriptions),
    rating,
    imageUrl: `https://picsum.photos/400/300?random=${i + 1}`,
    likes,
    comments: [],
  };

  comments.forEach((comment) => {
    comment.bookPost = post;
    post.comments.push(comment);
  });

  return post;
});

export { users, books, bookPosts };
