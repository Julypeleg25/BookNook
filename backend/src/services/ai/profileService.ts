import { UserReviewModel } from "@models/UserReview";
import { UserProfile } from "../../types/ai";

export const buildUserProfileForRag = async (userId: string): Promise<UserProfile> => {
    const reviews = await UserReviewModel.find({ user: userId }).populate("book");

    const liked_books = reviews
        .filter((r) => r.rating >= 4)
        .map((r) => ({
            title: (r.book as any)?.title || "Unknown",
            rating: r.rating,
        }));

    const disliked_books = reviews
        .filter((r) => r.rating <= 2)
        .map((r) => ({
            title: (r.book as any)?.title || "Unknown",
            rating: r.rating,
        }));

    const allCategories = reviews
        .filter((r) => r.rating >= 4)
        .flatMap((r) => (r.book as any)?.categories || []);

    const interests = Array.from(new Set(allCategories)).slice(0, 5);

    return {
        liked_books,
        disliked_books,
        interests,
    };
};
