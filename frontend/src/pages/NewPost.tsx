import {
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import BookReferenceCard from "@components/postForm/BookReferenceCard";
import PostPublishSection from "@components/postForm/PostPublishSection";
import PostSetupSection from "@components/postForm/PostSetupSection";
import ReviewEditorSection from "@components/postForm/ReviewEditorSection";
import { useReviewFormPage } from "@/hooks/useReviewFormPage";

const NewPost = () => {
  const {
    book,
    bookId,
    canSubmit,
    form,
    isLoading,
    isLoadingReview,
    isSaving,
    onCancel,
    onSubmit,
    reviewId,
    reviewLength,
  } = useReviewFormPage();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!bookId && !isLoadingReview) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No book selected. Please select a book to review.</Alert>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        minHeight: "calc(100vh - 4.5rem)",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 4 },
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={2.25} maxWidth="76rem" mx="auto">
        {isSaving && (
          <LinearProgress
            sx={{
              position: "fixed",
              top: "4.5rem",
              left: 0,
              right: 0,
              zIndex: (theme) => theme.zIndex.appBar + 1,
            }}
          />
        )}

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-end" }}
          gap={2}
        >
          <Stack spacing={0.5} maxWidth="44rem">
            <Typography variant="h4" fontWeight={800}>
              {reviewId ? "Edit Review" : "Write Review"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Add a rating, image, and clear thoughts for other readers.
            </Typography>
          </Stack>
        </Stack>

        {book && <BookReferenceCard book={book} />}

        <PostSetupSection control={control} errors={errors} setValue={setValue} />

        <ReviewEditorSection
          control={control}
          errors={errors}
          reviewLength={reviewLength}
        />

        <PostPublishSection
          disabled={!canSubmit}
          isEditMode={Boolean(reviewId)}
          isSaving={isSaving}
          onCancel={onCancel}
        />
      </Stack>
    </Box>
  );
};

export default NewPost;
