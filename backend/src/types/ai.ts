export interface UserProfile {
    liked_books: Array<{ title: string; rating: number }>;
    disliked_books: Array<{ title: string; rating: number }>;
    interests: string[];
}
