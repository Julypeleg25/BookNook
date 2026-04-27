import {
    Box,
    Typography,
    Avatar,
    TextField,
    Button,
    Stack,
    Divider,
} from "@mui/material";
import type { PostComment } from "@models/Book";
import { useState } from "react";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import { formatDate } from "@/utils/dateUtils";
import useUserStore from "@/state/useUserStore";
import { userReviewService } from "@/api/services/userReviewService";
import { useSnackbar } from "notistack";

interface CommentsSectionProps {
    postId: string;
    comments: PostComment[];
}

const CommentsSection = ({ postId, comments: initialComments }: CommentsSectionProps) => {
    const { user, isAuthenticated } = useUserStore();
    const [comments, setComments] = useState<PostComment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        if (!isAuthenticated) {
            enqueueSnackbar("Please login to comment", { variant: "info" });
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedCommentsRaw = await userReviewService.addComment(postId, newComment);

            // Map raw comments back to PostComment interface if needed
            const updatedComments: PostComment[] = updatedCommentsRaw.map((c: any) => ({
                id: c._id,
                user: c.user,
                createdDate: c.createdAt,
                content: c.comment
            }));

            setComments(updatedComments);
            setNewComment("");
            enqueueSnackbar("Comment added!", { variant: "success" });
        } catch (error) {
            enqueueSnackbar("Error adding comment", { variant: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: "1rem", backgroundColor: "rgba(0,0,0,0.02)", borderRadius: "0 0 1rem 1rem" }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: "1.1rem", fontWeight: 600 }}>
                Comments ({comments.length})
            </Typography>

            <Stack spacing={2} sx={{ mb: 3, maxHeight: "20rem", overflowY: "auto", pr: 1 }}>
                {comments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No comments yet. Be the first to comment!
                    </Typography>
                ) : (
                    comments.map((comment) => (
                        <Box key={comment.id}>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <Avatar
                                    src={getAvatarSrcUrl(comment.user.avatar)}
                                    sx={{ width: 24, height: 24 }}
                                />
                                <Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                            {comment.user.username}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(comment.createdDate)}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {comment.content}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                        </Box>
                    ))
                )}
            </Stack>

            <Box sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Write a comment..."
                    variant="outlined"
                    size="small"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmitting}
                    sx={{ mb: 1 }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAddComment}
                        disabled={isSubmitting || !newComment.trim()}
                    >
                        {isSubmitting ? "Posting..." : "Post Comment"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CommentsSection;
