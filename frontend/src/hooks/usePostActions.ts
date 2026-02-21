import { useState } from "react";
import { useSnackbar } from "notistack";
import useUserStore from "@/state/useUserStore";
import { userReviewService } from "@/api/services/userReviewService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookPost } from "@/models/Book";

export const usePostActions = (post: BookPost) => {
  const { user, isAuthenticated } = useUserStore();
  const [likes, setLikes] = useState<string[]>(post.likes);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { mutate: deleteReview } = useMutation({
    mutationFn: (post: BookPost) => userReviewService.deleteReview(post.id),
    onSuccess: () => {
      enqueueSnackbar("Review deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || "Failed to delete review", {
        variant: "error",
      });
    },
  });

  const isLiked = user?.id ? likes.includes(user.id) : false;

  const isAuthor =
    user?.id && post.user
      ? user.id === (post.user as any).id || user.id === (post.user as any)._id
      : false;

  const handleDelete = () => {
    if (!isAuthor) {
      enqueueSnackbar("You can only delete your own posts", {
        variant: "warning",
      });
      return;
    }
    deleteReview(post);
  };
  const handleLikeToggle = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!isAuthenticated) {
      enqueueSnackbar("Please login to like posts", { variant: "info" });
      return;
    }

    if (isAuthor) {
      enqueueSnackbar("You cannot like your own post", { variant: "warning" });
      return;
    }

    const previousLikes = [...likes];
    const newLikes = isLiked
      ? likes.filter((id) => id !== user.id)
      : [...likes, user.id];

    setLikes(newLikes);

    try {
      if (isLiked) {
        await userReviewService.unlikeReview(post.id);
      } else {
        await userReviewService.likeReview(post.id);
      }
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
    } catch (error) {
      setLikes(previousLikes);
      enqueueSnackbar("Error updating like", { variant: "error" });
    }
  };

  const { mutate: addComment, isPending: isAddingComment } = useMutation({
    mutationFn: (comment: string) =>
      userReviewService.addComment(post.id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review", post.id] });
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
      enqueueSnackbar("Comment added!", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to add comment", { variant: "error" });
    },
  });

  return {
    likes,
    isLiked,
    isAuthor,
    handleLikeToggle,
    addComment,
    isAddingComment,
    isAuthenticated,
    handleDelete,
  };
};
