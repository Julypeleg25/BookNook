import { Avatar, Box, Divider } from "@mui/material";
import { forwardRef, useRef, useImperativeHandle, useMemo, useState } from "react";
import { timeAgo } from "@utils/dateUtils";
import type { BookPost } from "@models/Book";
import NewComment, { type NewCommentRef } from "./NewComment";
import CommentsHeader from "./CommentsHeader";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import useUserStore from "@/state/useUserStore";
import { sortComments, type CommentSortOrder } from "@/utils/commentUtils";
import { invalidateReviewCaches } from "@/api/queryCache";

interface CommentsSectionProps {
  bookPost: BookPost;
}

export interface CommentsSectionRef {
  focusInput: () => void;
}

const CommentsSection = forwardRef<CommentsSectionRef, CommentsSectionProps>(
  ({ bookPost }, ref) => {
    const newCommentRef = useRef<NewCommentRef>(null);
    const [sortOrder, setSortOrder] = useState<CommentSortOrder>("mostRecent");
    const { user } = useUserStore();

    useImperativeHandle(ref, () => ({
      focusInput: () => newCommentRef.current?.focus(),
    }));

    const queryClient = useQueryClient();
    const { mutate: addComment } = useMutation({
      mutationFn: (comment: string) =>
        userReviewService.addComment(bookPost.id, comment),
      onSuccess: () => {
        invalidateReviewCaches(queryClient, { reviewId: bookPost.id });
      },
    });

    const handleAddComment = (comment: string) => {
      addComment(comment);
    };

    const sortedComments = useMemo(
      () => sortComments(bookPost.comments, sortOrder),
      [bookPost.comments, sortOrder],
    );

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
        }}
      >
        <Box
          justifySelf="center"
          width="100%"
        >
          <NewComment ref={newCommentRef} avatarUrl={user?.avatar} onSubmit={handleAddComment} />
          <Divider
            style={{ width: "93%", justifySelf: "center", opacity: 0.3 }}
          />
          <CommentsHeader
            length={bookPost.comments.length}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
          {sortedComments.map((comment) => (
            <Box key={comment.id} style={{ padding: "1rem" }}>
              <Box
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Avatar src={getAvatarSrcUrl(comment.user.avatar)} />
                <div style={{ fontWeight: "bold", fontSize: "1.15rem" }}>
                  {comment.user.username}
                </div>
                <div style={{ opacity: 0.7 }}>
                  {timeAgo(comment.createdDate)}
                </div>
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
          ))}
        </Box>
      </Box>
    );
  }
);

export default CommentsSection;
