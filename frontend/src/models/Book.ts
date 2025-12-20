interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  publishedDate: string;
  genre: string;
}

interface BookPost {
  id: string;
  book: Book;
  user: User;
  createdDate: Date;
  description: string;
  rating: number;
  imageUrl: string;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  user: User;
  createdDate: Date;
  content: string;
  bookPost: BookPost;
}

interface User {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
}

export type { Book, BookPost, Comment, User };
