import type { User, Book, BookPost, Comment } from "./models/Book";

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
  "Absolutely loved this book, couldn't put it down!",
  "Very insightful and thought-provoking.",
  "A bit slow at times, but worth finishing.",
  "Amazing storytelling and character development.",
  "I learned so much from this one.",
  "Not what I expected, but pleasantly surprised.",
  "Perfect read for a weekend.",
  "Would highly recommend to friends.",
  "Engaging from start to finish.",
  "Interesting concepts, well explained.",
  "Emotional and heartfelt.",
  "I couldn’t relate to some parts.",
  "Classic book, timeless lessons.",
  "Motivational and inspiring.",
  "A must-read for fans of the genre.",
];

const commentContents = [
  "Totally agree with this!",
  "I had a different opinion on this part.",
  "Loved the insight you shared.",
  "Couldn’t agree more!",
  "Interesting perspective!",
  "This made me want to reread the book.",
  "Nice review, thanks for sharing!",
  "I felt the same way.",
  "I had mixed feelings about this one.",
  "Great summary of the book.",
];

// helper to pick a random item
const randomItem = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// Generate 40 book posts
const bookPosts: BookPost[] = Array.from({ length: 40 }, (_, i) => {
  const book = randomItem(books);
  const user = randomItem(users);
  const createdDate = new Date(
    Date.now() - Math.floor(Math.random() * 10000000000)
  );
  const likes = Math.floor(Math.random() * 100);
  const rating = Math.floor(Math.random() * 5) + 1;

  // generate 0-3 comments per post
  const comments: Comment[] = Array.from(
    { length: Math.floor(Math.random() * 4) },
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
