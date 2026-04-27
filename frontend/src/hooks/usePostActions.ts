import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import { enqueueSnackbar } from "notistack";

export const usePostActions = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteReviewMutation = useMutation({
    mutationFn: (postId: string) => userReviewService.deleteReview(postId),
    onSuccess: () => {
      enqueueSnackbar("Review deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
    },
    onError: (error: unknown) => {
      enqueueSnackbar((error as Error).message || "Failed to delete review", {
        variant: "error",
      });
    },
  });

  const handleDeleteConfirm = (postId: string) => {
    deleteReviewMutation.mutate(postId);
    setIsDeleteModalOpen(false);
  };

  return {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleDeleteConfirm,
    isDeleting: deleteReviewMutation.isPending,
  };
};
