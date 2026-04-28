import type { PostComment } from "@/models/Book";

export type CommentSortOrder = "mostRecent" | "leastRecent";

const getCommentTime = (comment: PostComment): number =>
  new Date(comment.createdDate).getTime();

export const sortComments = (
  comments: readonly PostComment[],
  sortOrder: CommentSortOrder,
): PostComment[] =>
  [...comments].sort((first, second) => {
    const firstTime = getCommentTime(first);
    const secondTime = getCommentTime(second);
    const dateDiff =
      sortOrder === "mostRecent"
        ? secondTime - firstTime
        : firstTime - secondTime;

    return dateDiff || first.id.localeCompare(second.id);
  });
