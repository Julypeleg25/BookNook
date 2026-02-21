export const POPULAR_GENRES = [
  "Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Horror",
  "History",
  "Biography",
] as const;

export type PopularGenre = typeof POPULAR_GENRES[number];
