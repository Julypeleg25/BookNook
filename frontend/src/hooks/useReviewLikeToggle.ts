import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { userReviewService } from "@/api/services/userReviewService";
import { getErrorMessage } from "@/api/apiError";
import {
  invalidateReviewCaches,
  syncReviewLikesInCaches,
} from "@/api/queryCache";
import useUserStore from "@/state/useUserStore";

interface UseReviewLikeToggleOptions {
  reviewId: string;
  reviewUserId?: string;
  initialLikes: string[];
}

interface LikeMutationContext {
  previousLikes: string[];
  nextLikes: string[];
}

const normalizeLikes = (likes: unknown): string[] =>
  Array.isArray(likes) ? likes.filter((value): value is string => typeof value === "string") : [];

export const useReviewLikeToggle = ({
  reviewId,
  reviewUserId,
  initialLikes,
}: UseReviewLikeToggleOptions) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { user, isAuthenticated } = useUserStore();
  const [likes, setLikes] = useState<string[]>(normalizeLikes(initialLikes));

  useEffect(() => {
    setLikes(normalizeLikes(initialLikes));
  }, [initialLikes]);

  const userId = user?.id ?? "";
  const isAuthor = Boolean(userId) && reviewUserId === userId;
  const isLiked = Boolean(userId) && likes.includes(userId);

  const mutation = useMutation<void, Error, boolean, LikeMutationContext>({
    mutationFn: async (wasLiked: boolean) => {
      if (wasLiked) {
        await userReviewService.unlikeReview(reviewId);
        return;
      }

      await userReviewService.likeReview(reviewId);
    },
    onMutate: async (wasLiked: boolean) => {
      const previousLikes = normalizeLikes(likes);
      const nextLikes = wasLiked
        ? previousLikes.filter((id) => id !== userId)
        : [...previousLikes, userId];

      setLikes(nextLikes);
      syncReviewLikesInCaches(queryClient, reviewId, nextLikes);

      return { previousLikes, nextLikes };
    },
    onError: (error, _variables, context) => {
      const previousLikes = context?.previousLikes ?? normalizeLikes(initialLikes);
      setLikes(previousLikes);
      syncReviewLikesInCaches(queryClient, reviewId, previousLikes);
      enqueueSnackbar(getErrorMessage(error, "Error updating like"), {
        variant: "error",
      });
    },
    onSuccess: (_data, _variables, context) => {
      if (context) {
        syncReviewLikesInCaches(queryClient, reviewId, context.nextLikes);
      }
    },
    onSettled: () => {
      invalidateReviewCaches(queryClient, { reviewId });
    },
  });

  const toggleLike = () => {
    if (!isAuthenticated) {
      enqueueSnackbar("Please login to like posts", { variant: "info" });
      return;
    }

    if (isAuthor) {
      enqueueSnackbar("You cannot like your own post", { variant: "warning" });
      return;
    }

    if (!userId || mutation.isPending) {
      return;
    }

    mutation.mutate(isLiked);
  };

  return {
    likes,
    isLiked,
    isAuthor,
    isUpdatingLike: mutation.isPending,
    toggleLike,
  };
};
