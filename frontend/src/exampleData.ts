import type { User, Book, BookPost, Comment } from "./models/Book";
import { faker } from "@faker-js/faker";

const users: User[] = [
  {
    id: "u1",
    username: "julydev",
    name: "July Cohen",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "u2",
    username: "booklover",
    name: "Emma Stone",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "u3",
    username: "reading_addict",
    name: "Daniel Green",
    avatarUrl: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: "u4",
    username: "nightreader",
    name: "Sophia Lee",
    avatarUrl: "https://i.pravatar.cc/150?img=56",
  },
];

const books: Book[] = [
  {
    id: "b1",
    title: "The Midnight Library",
    author: "Matt Haig",
    description: "A journey through parallel lives and choices.",
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/81J6APjwxlL.jpg",
    publishedDate: "2020-09-29",
    genre: "Fiction",
  },
  {
    id: "b2",
    title: "Atomic Habits",
    author: "James Clear",
    description: "Small habits, remarkable results.",
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
    publishedDate: "2018-10-16",
    genre: "Self-help",
  },
  {
    id: "b3",
    title: "1984",
    author: "George Orwell",
    description: "A dystopian classic about control and truth.",
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg",
    publishedDate: "1949-06-08",
    genre: "Dystopian",
  },
];

const postDescriptions = [
  Array.from({ length: 10 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n"),
  Array.from({ length: 10 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n"),
];

const commentContents = [
  Array.from({ length: 1 })
    .map((_, i) => faker.lorem.paragraph())
    .join("\n\n").repeat(2),
  
];

// helper to pick a random item
const randomItem = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// Generate 40 book posts
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
