import type { Book, BookPost } from "@/models/Book";
import type {
  ReviewComment,
  ReviewCommentUser,
  UserReview,
} from "@/models/UserReview";
import type { User } from "@/models/User";
import type { UserDto } from "@shared/dtos/user.dto";

export const getCommentUser = (user: ReviewCommentUser): User => {
  if (typeof user === "string") {
    return { id: user, username: "Unknown" };
  }

  return {
    id: user.id || user._id || "",
    username: user.username || "Unknown",
    avatar: user.avatar,
  };
};

export const mapReviewToBookPost = (review: UserReview): BookPost => ({
  id: review._id,
  book: review.book as Book,
  user: {
    id: review.user._id,
    username: review.user.username,
    avatar: review.user.avatar,
  },
  createdDate: review.createdAt,
  description: review.review,
  rating: review.rating,
  imageUrl: review.picturePath || review.imageUrl,
  likes: review.likes || [],
  comments: (review.comments || []).map((comment: ReviewComment) => {
    const commentUser = getCommentUser(comment.user);

    return {
      id: comment._id,
      user: commentUser,
      createdDate: comment.createdAt,
      content: comment.comment,
    };
  }),
});

export const applyUserToReview = (
  review: UserReview,
  user: UserDto,
): UserReview => {
  const userIdMatches = review.user._id === user.id;

  return {
    ...review,
    user: userIdMatches
      ? {
          ...review.user,
          username: user.username,
          avatar: user.avatar,
        }
      : review.user,
    comments: review.comments.map((comment) => ({
      ...comment,
      user:
        getCommentUser(comment.user).id === user.id
          ? {
              ...getCommentUser(comment.user),
              username: user.username,
              avatar: user.avatar,
            }
          : comment.user,
    })),
  };
};

export const applyUserToReviews = (
  reviews: UserReview[] | undefined,
  user: UserDto,
): UserReview[] | undefined =>
  reviews?.map((review) => applyUserToReview(review, user));
