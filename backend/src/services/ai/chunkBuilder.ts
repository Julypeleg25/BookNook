import { IBook } from "@models/Book";
import { IUserReview } from "@models/UserReview";
import { IUser } from "@models/User";

/**
 * Build the embeddable text chunk for a book.
 * Template: Book: [Title] | Author: [Author] | Genres: [Genres] | Summary: [Description]
 */
export const buildBookChunk = (book: IBook): string => {
    const title = book.title?.trim() || "Unknown Title";
    const authors = (book.authors ?? []).join(", ") || "Unknown Author";
    const genres = (book.categories ?? [])
        .map((g) => g.trim())
        .filter(Boolean)
        .join(", ") || "Uncategorized";
    const description = book.description?.trim() || "No description available.";

    return `Book: ${title} | Author: ${authors} | Genres: ${genres} | Summary: ${description}`;
};

/**
 * Build the embeddable text chunk for a review.
 * Template: User [Username] reviewed [Book Title]. Rating: [Rating]/5. Review: [Content]. User's typical taste: [User's top 3 genres].
 */
export const buildReviewChunk = (
    username: string,
    bookTitle: string,
    rating: number,
    content: string,
    typicalTaste: string[]
): string => {
    const tastes = typicalTaste.slice(0, 3).join(", ") || "Diverse";
    return `User ${username} reviewed ${bookTitle}. Rating: ${rating}/5. Review: ${content}. User's typical taste: ${tastes}.`;
};

/**
 * Build the embeddable text chunk for a user profile.
 * Template: User [Username] Profile. Read List: [Titles]. Wishlist: [Titles]. Top Themes: [Themes].
 */
export const buildProfileChunk = (
    username: string,
    readList: string[],
    wishList: string[],
    topThemes: string[]
): string => {
    const reads = readList.join(", ") || "None yet";
    const wishes = wishList.join(", ") || "Empty";
    const themes = topThemes.join(", ") || "Eclectic";

    return `User ${username} Profile. Read List: ${reads}. Wishlist: ${wishes}. Top Themes: ${themes}.`;
};
