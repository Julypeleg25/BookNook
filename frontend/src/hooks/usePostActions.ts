import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { invalidateReviewCaches } from "@/api/queryCache";
import { getErrorMessage } from "@/api/apiError";

export const usePostActions = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteReviewMutation = useMutation({
    mutationFn: (postId: string) => userReviewService.deleteReview(postId),
    onSuccess: () => {
      enqueueSnackbar("Review deleted successfully!", { variant: "success" });
      invalidateReviewCaches(queryClient);
      navigate("/posts");
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error, "Failed to delete review"), {
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
