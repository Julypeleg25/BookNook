/**
 * vectorSyncService.ts
 *
 * Provides functions called on book/review/user CRUD.
 */

import { IBook } from "@models/Book";
import { IUserReview, UserReviewModel } from "@models/UserReview";
import User, { IUser } from "@models/User";
import { bookRepository } from "@repositories/bookRepository";
import { buildBookChunk, buildReviewChunk, buildProfileChunk } from "@services/ai/chunkBuilder";
import { generateEmbedding } from "@services/ai/embeddingService";
import { upsertChunk, deleteChunkBySourceId } from "@services/ai/vectorRepository";
import { logger } from "@utils/logger";


/**
 * Calculates a user's top genres based on their reviews.
 */
async function getUserTopGenres(userId: string): Promise<string[]> {
    const reviews = await UserReviewModel.find({ user: userId });
    const genresCount: Record<string, number> = {};

    for (const review of reviews) {
        const book = await bookRepository.findById(review.book.toString());
        if (book && book.categories) {
            book.categories.forEach(g => {
                genresCount[g] = (genresCount[g] || 0) + 1;
            });
        }
    }

    return Object.entries(genresCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);
}


export const syncBookToVector = async (book: IBook): Promise<void> => {
    try {
        const text = buildBookChunk(book);
        const embedding = await generateEmbedding(text);

        await upsertChunk({
            sourceId: `book:${book._id.toString()}`,
            bookId: book._id.toString(),
            type: "book",
            text,
            embedding,
            rating: book.avgRating ?? null,
            metadata: {
                mongoId: book._id.toString(),
                title: book.title,
                authors: book.authors ?? [],
                genres: book.categories ?? [],
                userId: null,
            },
        });

        logger.info(`[VectorSync] Synced book ${book._id} to vector store.`);
    } catch (err) {
        logger.error(`[VectorSync] Failed to sync book ${book._id}:`, err);
    }
};

export const syncReviewToVector = async (review: IUserReview): Promise<void> => {
    try {
        const bookId = review.book?.toString() ?? "";
        const userId = review.user?.toString() ?? "";

        const [book, user] = await Promise.all([
            bookRepository.findById(bookId),
            User.findById(userId)
        ]);

        if (!book || !user) {
            throw new Error("Book or User not found for review sync");
        }

        const typicalTaste = await getUserTopGenres(userId);

        const text = buildReviewChunk(
            user.username,
            book.title,
            review.rating,
            review.review,
            typicalTaste
        );
        const embedding = await generateEmbedding(text);

        await upsertChunk({
            sourceId: `review:${review._id.toString()}`,
            bookId,
            type: "review",
            text,
            embedding,
            rating: review.rating,
            metadata: {
                mongoId: review._id.toString(),
                bookId,
                bookTitle: book.title,
                genres: book.categories ?? [],
                userId,
                username: user.username,
                rating: review.rating,
            },
        });

        logger.info(`[VectorSync] Synced review ${review._id} to vector store.`);
    } catch (err) {
        logger.error(`[VectorSync] Failed to sync review ${review._id}:`, err);
    }
};

export const deleteReviewFromVector = async (reviewId: string): Promise<void> => {
    try {
        await deleteChunkBySourceId(`review:${reviewId}`);
        logger.info(`[VectorSync] Deleted review ${reviewId} from vector store.`);
    } catch (err) {
        logger.error(`[VectorSync] Failed to delete review ${reviewId}:`, err);
    }
};


export const syncUserProfileToVector = async (user: IUser): Promise<void> => {
    try {
        const userId = user._id.toString();

        const likedReviews = await UserReviewModel.find({ likes: userId });

        const inferredInterests: Set<string> = new Set();
        const dislikes: Set<string> = new Set();
        const interestThemes: Record<string, number> = {};

        for (const review of likedReviews) {
            const book = await bookRepository.findById(review.book.toString());
            if (!book) continue;

            const bookIdentifier = `${book.title} (by ${book.authors?.join(", ")})`;

            if (review.rating >= 4) {
                inferredInterests.add(bookIdentifier);
                book.categories?.forEach(cat => {
                    interestThemes[cat] = (interestThemes[cat] || 0) + 1;
                });
            }
            else if (review.rating <= 2) {
                dislikes.add(`Avoid books like ${bookIdentifier}`);
            }
        }

        const topThemes = Object.entries(interestThemes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([theme]) => theme);

        const text = buildProfileChunk(
            user.username,
            user.readlist || [],
            user.wishlist || [],
            Array.from(inferredInterests).slice(0, 10),
            Array.from(dislikes).slice(0, 5),
            topThemes
        );
        const embedding = await generateEmbedding(text);

        await upsertChunk({
            sourceId: `profile:${userId}`,
            bookId: "N/A",
            type: "profile",
            text,
            embedding,
            metadata: {
                userId,
                username: user.username,
                type: "profile"
            },
        });

        logger.info(`[VectorSync] Synced behavioral profile for user ${user.username} to vector store.`);
    } catch (err) {
        logger.error(`[VectorSync] Failed to sync profile for user ${user.username}:`, err);
    }
};

