import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import { enqueueSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router-dom";
import { invalidateReviewCaches } from "@/api/queryCache";
import { getErrorMessage } from "@/api/apiError";

export const usePostActions = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const navigateAfterDelete = () => {
    const previousLocation = location.state as
      | { from?: { pathname?: string; search?: string; hash?: string } }
      | undefined;
    const previousPath = previousLocation?.from?.pathname;

    if (previousPath && !previousPath.includes("/post/edit/")) {
      navigate(
        `${previousPath}${previousLocation.from?.search ?? ""}${previousLocation.from?.hash ?? ""}`,
        { replace: true },
      );
      return;
    }

    const historyState = window.history.state as { idx?: number } | null;
    if ((historyState?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }

    navigate("/posts", { replace: true });
  };

  const deleteReviewMutation = useMutation({
    mutationFn: (postId: string) => userReviewService.deleteReview(postId),
    onSuccess: () => {
      enqueueSnackbar("Review deleted successfully!", { variant: "success" });
      invalidateReviewCaches(queryClient);
      navigateAfterDelete();
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
