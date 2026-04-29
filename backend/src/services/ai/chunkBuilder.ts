import { IBook } from "@models/Book";

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

export const buildProfileChunk = (
    username: string,
    wishList: string[],
    inferredInterests: string[],
    dislikes: string[],
    topThemes: string[]
): string => {
    const wishes = wishList.length > 0 ? wishList.join(", ") : "Empty";
    const interests = inferredInterests.length > 0 ? inferredInterests.join(", ") : "None detected yet";
    const avoid = dislikes.length > 0 ? dislikes.join(", ") : "None detected yet";
    const themes = topThemes.length > 0 ? topThemes.join(", ") : "Eclectic";

    return `User ${username} Profile. Explicit Wishlist: [${wishes}]. Inferred Interests (from Liked Reviews): [${interests}]. Dislikes: [${avoid}]. Top Themes: [${themes}].`.trim();
};
