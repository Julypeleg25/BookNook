import { Avatar, Box, CircularProgress, Divider, IconButton, Tooltip } from "@mui/material";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { timeAgo } from "@utils/dateUtils";
import type { BookPost } from "@models/Book";
import NewComment, { type NewCommentRef } from "./NewComment";
import CommentsHeader from "./CommentsHeader";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import useUserStore from "@/state/useUserStore";
import {
  invalidateReviewCaches,
  syncReviewCommentsInCaches,
} from "@/api/queryCache";
import { FiTrash2 } from "react-icons/fi";
import { enqueueSnackbar } from "notistack";

interface CommentsSectionProps {
  bookPost: BookPost;
}

export interface CommentsSectionRef {
  focusInput: () => void;
}

const CommentsSection = forwardRef<CommentsSectionRef, CommentsSectionProps>(
  ({ bookPost }, ref) => {
    const newCommentRef = useRef<NewCommentRef>(null);
    const { user } = useUserStore();

    useImperativeHandle(ref, () => ({
      focusInput: () => newCommentRef.current?.focus(),
    }));

    const queryClient = useQueryClient();
    const { mutate: addComment } = useMutation({
      mutationFn: (comment: string) =>
        userReviewService.addComment(bookPost.id, comment),
      onSuccess: (comments) => {
        syncReviewCommentsInCaches(queryClient, bookPost.id, comments);
        invalidateReviewCaches(queryClient, { reviewId: bookPost.id });
      },
      onError: () => {
        enqueueSnackbar("Error adding comment", { variant: "error" });
      },
    });
    const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
      mutationFn: (commentId: string) =>
        userReviewService.deleteComment(bookPost.id, commentId),
      onSuccess: (comments) => {
        syncReviewCommentsInCaches(queryClient, bookPost.id, comments);
        invalidateReviewCaches(queryClient, { reviewId: bookPost.id });
        enqueueSnackbar("Comment deleted", { variant: "success" });
      },
      onError: () => {
        enqueueSnackbar("Error deleting comment", { variant: "error" });
      },
    });

    const handleAddComment = (comment: string) => {
      addComment(comment);
    };

    return (
      <Box
        sx={{
          borderRadius: "1rem",
          border: "1px solid",
          borderColor: "divider",
          maxHeight: "30rem",
          minHeight: "18rem",
          overflowY: "auto",
          scrollbarGutter: "stable",
          marginTop: "2rem",
          bgcolor: "background.paper",
          position: "relative",
        }}
      >
        <Box justifySelf="center" width="100%">
          <NewComment ref={newCommentRef} avatarUrl={user?.avatar} onSubmit={handleAddComment} />
          <Divider
            style={{ width: "93%", justifySelf: "center", opacity: 0.3 }}
          />
          <CommentsHeader length={bookPost.comments.length} />
          {bookPost.comments.map((comment) => {
            const canDelete =
              Boolean(user.id) &&
              (comment.user.id === user.id || bookPost.user.id === user.id);

            return (
            <Box key={comment.id} style={{ padding: "1rem" }}>
              <Box
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Avatar src={getAvatarSrcUrl(comment.user.avatar)} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ fontWeight: "bold", fontSize: "1.15rem" }}>
                      {comment.user.username}
                    </div>
                    <div style={{ opacity: 0.7 }}>
                      {timeAgo(comment.createdDate)}
                    </div>
                  </Box>
                </Box>
                {canDelete ? (
                  <Tooltip title="Delete comment">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => deleteComment(comment.id)}
                        disabled={isDeletingComment}
                        sx={{ flexShrink: 0 }}
                      >
                        {isDeletingComment ? (
                          <CircularProgress size={16} />
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : null}
              </Box>
              <Box
                sx={{
                  ml: "3rem",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {comment.content}
              </Box>
            </Box>
          )})}
        </Box>
      </Box>
    );
  }
);

export default CommentsSection;
