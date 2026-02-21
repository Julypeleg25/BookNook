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

  const isLiked = user?.id ? likes.includes(user.id) : false;
  
  // Safely compare user IDs
  const isAuthor = user?.id && post.user 
    ? user.id === (post.user as any).id || user.id === (post.user as any)._id 
    : false;

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
      ? likes.filter(id => id !== user.id)
      : [...likes, user.id];

    setLikes(newLikes); // Optimistic update

    try {
      if (isLiked) {
        await userReviewService.unlikeReview(post.id);
      } else {
        await userReviewService.likeReview(post.id);
      }
      // Optional: Invalidate queries if we want server-side sync
      // queryClient.invalidateQueries({ queryKey: ["allReviews"] });
    } catch (error) {
      setLikes(previousLikes); // Rollback
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
    }
  });

  return {
    likes,
    isLiked,
    isAuthor,
    handleLikeToggle,
    addComment,
    isAddingComment,
    isAuthenticated
  };
};
