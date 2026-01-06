import { GenreOptions, languageMenuItems } from "@components/searchFilters/models/SearchFiltersOptions";
import type { Book, BookPost, Comment } from "@models/Book";
import { faker } from "@faker-js/faker";
import type { User } from "@models/User";

const randomItems = <T>(arr: T[], min = 1, max = 3): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
};

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



const postDescriptions = [
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n"),
];

const commentContents = [
  Array.from({ length: 1 })
    .map(() => faker.lorem.paragraph())
    .join("\n\n")
    .repeat(2),
];

// helper to pick a random item
const randomItem = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// Generate 40 book posts

const books: Book[] = Array.from({ length: 200 }, (_, i) => ({
  id: `b${i + 1}`,
  title: faker.book.title(),
  author: faker.person.fullName(),
  description: faker.lorem.paragraph(),
  coverImage: `https://picsum.photos/300/450?random=book-${i + 1}`,
  publishedDate: faker.date.past({ years: 30 }),
  genres: randomItems(Object.values(GenreOptions), 1, 3),
  pages: faker.number.int({ min: 120, max: 900 }),
  publisher: faker.person.fullName(),
  language: randomItem(languageMenuItems),
}));

  const bookPosts: BookPost[] = Array.from({ length: 40 }, (_, i) => {
    const book = randomItem(books);
    const user = randomItem(users);
    const createdDate = new Date(
      Date.now() - Math.floor(Math.random() * 100000000)
    );
    const likes = Math.floor(Math.random() * 100);
    const rating = Math.floor(Math.random() * 5) + 1;
  
    // generate 0-3 comments per post
    const comments: Comment[] = Array.from(
      { length: Math.floor(Math.random() * 20) },
      (_, j) => {
        const commentUser = randomItem(users);
        return {
          id: `c${i}-${j}`,
          user: commentUser,
          createdDate: new Date(createdDate.getTime() + j * 1000000),
          bookPost: {} as BookPost, // temporary placeholder, will attach after
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
  
    // attach comments to the post
    comments.forEach((comment) => {
      comment.bookPost = post;
      post.comments.push(comment);
    });
  
    return post;
  });
export { users, books, bookPosts };
