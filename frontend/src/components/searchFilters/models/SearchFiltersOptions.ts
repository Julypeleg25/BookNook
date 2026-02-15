export interface ISearchFiltersForm {
  language: string;
  genre: string;
  author: string;
  yearPublishedFrom: string;
  yearPublishedTo: string;
  likesAmount: number;
  reviewsAmount: number;
  rating: number;
  username: string;
}

export const amountOptions = {
  LOW_AMOUT: "lowAmount",
  MEDIUM_AMOUNT: "mediumAmount",
  HIGH_AMOUNT: "highAmount",
} as const;
type AmountOptionsType = (typeof amountOptions)[keyof typeof amountOptions];

const likesOptions: Record<AmountOptionsType, string> = {
  lowAmount: "50+",
  mediumAmount: "100+",
  highAmount: "500+",
};

const likesMenuItems = Object.entries(likesOptions).map(([value, label]) => ({
  value,
  label,
}));

const reviewsOptions: Record<AmountOptionsType, string> = {
  lowAmount: "20+",
  mediumAmount: "80+",
  highAmount: "150+",
};

const reviewsMenuItems = Object.entries(reviewsOptions).map(
  ([value, label]) => ({
    value,
    label,
  })
);

const LanguageOptions = {
  HEBREW: "Hebrew",
  ENGLISH: "English",
  SPANISH: "Spanish",
  DANISH: "Danish",
  FRENCH: "French",
  GERMAN: "German",
  ARABIC: "Arabic",
  IRANIAN: "Iranian",
  RUSSIAN: "Russian",
  TURKISH: "Turkish",
  JAPANESE: "Japanese",
  CHINESE: "Chinese",
  ROMANIAN: "Romanian",
  ESTONIAN: "Estonian",
  ETIOPIAN: "Ethiopian",
  SWEDISH: "Swedish",
  KOREAN: "Korean",
  GREEK: "Greek",
  GEORGIAN: "Georgian",
  WELSH: "Welsh",
  HUNGARIAN: "Hungarian",
  HINDI: "Hindi",
  ITALIAN: "Italian",
  PORTUGUESE: "Portuguese",
  FINNISH: "Finnish",
  CZECH: "Czech",
  DUTCH: "Dutch",
  NORWEGIAN: "Norwegian",
  KAZAKH: "Kazakh",
  LATVIAN: "Latvian",
  LITHUANIAN: "Lithuanian",
  POLISH: "Polish",
  SLOVAK: "Slovak",
  SLOVENIAN: "Slovenian",
  SERBIAN: "Serbian",
  CROATIAN: "Croatian",
  BULGARIAN: "Bulgarian",
} as const;

export type LanguageOptionsType =
  (typeof LanguageOptions)[keyof typeof LanguageOptions];

const languageMenuItems = Object.entries(LanguageOptions).map(([_, label]) => ({
  value: label,
  label,
}));

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

const yearFieldRules = {
  pattern: {
    value: /^\d{4}$/,
    message: "Please enter a valid year (YYYY)",
  },
  minLength: {
    value: 4,
    message: "Year must be 4 digits",
  },
  maxLength: {
    value: 4,
    message: "Year must be 4 digits",
  },
};

export {
  likesMenuItems,
  yearFieldRules,
  reviewsMenuItems,
  languageMenuItems,
  genreMenuItems,
};
