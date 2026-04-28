export type SearchMode = "books" | "posts";

export interface ISearchFiltersForm {
  genre: string;
  author: string;
  likesAmount: number;
  rating: number;
  username: string;
  minReviews: number;
}

export const GenreOptions = {
  FICTION: "Fiction",
  NON_FICTION: "Non-Fiction",
  MYSTERY: "Mystery",
  FANTASY: "Fantasy",
  SCIENCE_FICTION: "Science Fiction",
  BIOGRAPHY: "Biography",
  HISTORY: "History",
  ROMANCE: "Romance",
  THRILLER: "Thriller",
  SELF_HELP: "Self-Help",
  YOUNG_ADULT: "Young Adult",
  CHILDREN: "Children",
  POETRY: "Poetry",
  HORROR: "Horror",
  CLASSICS: "Classics",
  COMICS: "Comics",
  GRAPHIC_NOVELS: "Graphic Novels",
  RELIGION: "Religion",
  PHILOSOPHY: "Philosophy",
  ART: "Art",
  COOKING: "Cooking",
  TRAVEL: "Travel",
  EDUCATION: "Education",
  SCIENCE: "Science",
  TECHNOLOGY: "Technology",
  LAW: "Law",
  MEDICINE: "Medicine",
  PSYCHOLOGY: "Psychology",
  BUSINESS: "Business",
  ECONOMICS: "Economics",
  SPORTS: "Sports",
  MUSIC: "Music"
} as const;

export type GenreOptionsType = (typeof GenreOptions)[keyof typeof GenreOptions];

const genreMenuItems = Object.entries(GenreOptions).map(([_, label]) => ({
  value: label,
  label,
}));

export { genreMenuItems };

