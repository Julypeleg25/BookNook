import { Avatar, Box, Divider } from "@mui/material";
import { forwardRef, useRef, useImperativeHandle, useState } from "react";
import { timeAgo } from "@utils/dateUtils";
import type { BookPost } from "@models/Book";
import NewComment, { type NewCommentRef } from "./NewComment";
import CommentsHeader from "./CommentsHeader";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";

interface CommentsSectionProps {
  bookPost: BookPost;
}

export interface CommentsSectionRef {
  focusInput: () => void;
}

const CommentsSection = forwardRef<CommentsSectionRef, CommentsSectionProps>(
  ({ bookPost }, ref) => {
    const newCommentRef = useRef<NewCommentRef>(null);
    const [sortOrder, setSortOrder] = useState<string>("mostRecent");

    useImperativeHandle(ref, () => ({
      focusInput: () => newCommentRef.current?.focus(),
    }));

    const queryClient = useQueryClient();
    const { mutate: addComment } = useMutation({
      mutationFn: (comment: string) =>
        userReviewService.addComment(bookPost.id, comment),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["review", bookPost.id] });
      },
    });

    const handleAddComment = (comment: string) => {
      addComment(comment);
    };

    const sortedComments = [...bookPost.comments].sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime();
      const dateB = new Date(b.createdDate).getTime();
      return sortOrder === "mostRecent" ? dateB - dateA : dateA - dateB;
    });

    return (
      <Box
        sx={{
          borderRadius: "1rem",
          maxHeight: "30rem",
          overflowY: "scroll",
          marginTop: "2rem",
        }}
      >
        <Box
          justifySelf="center"
          style={{ backgroundColor: "white" }}
          width="100%"
        >
          <NewComment ref={newCommentRef} avatarUrl={bookPost.user.avatar} onSubmit={handleAddComment} />
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
              <div style={{ marginLeft: "3rem" }}>{comment.content}</div>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
);

export default CommentsSection;
