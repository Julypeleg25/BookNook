import {
  Stack,
  TextField,
  Button,
  Typography,
  Box,
  Rating,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  Controller,
  useForm,
  useWatch,
} from "react-hook-form";
import PostImageUpload from "@components/common/PostImageUpload";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import { booksService } from "@/api/services/bookService";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import {
  RATING_MAX,
  RATING_MIN,
  RATING_STEP,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
} from "@shared/constants/validation";
import { queryKeys } from "@/api/queryKeys";
import { invalidateReviewCaches } from "@/api/queryCache";
import type {
  PostFormLocationState,
  PostFormValues,
  UpdateReviewFormData,
} from "@/models/PostForm";
import { getErrorMessage } from "@/api/apiError";
import { formatDate } from "@/utils/dateUtils";

const NewPost = () => {
  const { bookId: routeBookId, id: reviewId } = useParams<{ bookId?: string; id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const locationState = location.state as PostFormLocationState | null;

  const bookFromState = locationState?.book;

  const { data: reviewData, isLoading: isLoadingReview } = useQuery({
    queryKey: reviewId ? queryKeys.review(reviewId) : queryKeys.reviewPrefix,
    queryFn: () => userReviewService.getReviewById(reviewId!),
    enabled: !!reviewId,
  });

  const bookId = routeBookId ||
    (typeof reviewData?.book === "string"
      ? reviewData.book
      : (reviewData?.book?.id || reviewData?.book?._id));

  const { data: bookData, isLoading: isLoadingBook } = useQuery({
    queryKey: bookId ? queryKeys.book(bookId) : queryKeys.bookPrefix,
    queryFn: async () => {
      if (!bookId || typeof bookId !== "string") return null;
      const response = await booksService.getById(bookId);
      return response.book;
    },
    enabled: !!bookId && !bookFromState,
  });

  const book = bookFromState || bookData || (typeof reviewData?.book === "object" ? reviewData.book : null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PostFormValues>({
    defaultValues: {
      review: "",
      image: "",
      rating: 0,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (reviewData) {
      reset({
        review: reviewData.review,
        rating: reviewData.rating,
        image: reviewData.picturePath || "",
      });
    }
  }, [reviewData, reset]);

  const review = useWatch({
    control,
    name: "review",
  });

  const createReviewMutation = useMutation({
    mutationFn: userReviewService.createReview,
    onSuccess: () => {
      enqueueSnackbar("Review created successfully!", { variant: "success" });
      invalidateReviewCaches(queryClient, { bookId });
      navigate("/posts");
    },
    onError: (error: unknown) => {
      enqueueSnackbar(
        getErrorMessage(error, "Failed to create review"),
        { variant: "error" }
      );
    },
  });



  const updateReviewMutation = useMutation({
    mutationFn: (data: UpdateReviewFormData) =>
      userReviewService.updateReview(data.id, {
        review: data.review.review,
        rating: data.review.rating,
        picture: data.review.image instanceof File ? data.review.image : undefined
      }),
    onSuccess: () => {
      enqueueSnackbar("Review updated successfully!", { variant: "success" });
      invalidateReviewCaches(queryClient, { bookId, reviewId });
      navigate(`/posts/${reviewId}`);
    },
    onError: (error: unknown) => {
      enqueueSnackbar(
        getErrorMessage(error, "Failed to update review"),
        { variant: "error" }
      );
    },
  });

  const isSaving = createReviewMutation.isPending || updateReviewMutation.isPending;

  const onSubmit = (data: PostFormValues) => {
    if (isSaving || !isDirty) return;

    if (reviewId) {
      updateReviewMutation.mutate({
        id: reviewId,
        review: data
      });
    } else {
      if (!bookId) return;
      createReviewMutation.mutate({
        bookId,
        rating: data.rating,
        review: data.review,
        picture: data.image instanceof File ? data.image : undefined,
      });
    }
  };

  const onCancel = () => {
    navigate(-1);
    reset();
  };

  if (isLoadingBook || isLoadingReview) {
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
    <Stack
      margin="2rem"
      justifyItems={"center"}
      maxWidth={"80rem"}
      spacing={3}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Typography fontSize="1.4rem" fontWeight={600}>
        {reviewId ? "Edit Review" : "Create Review"}
      </Typography>

      {book && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            boxShadow: 1,
            maxWidth: "54rem",
          }}
        >
          <Box
            component="img"
            src={getAvatarSrcUrl(book.thumbnail)}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x200?text=No+Cover";
            }}
            alt={book.title}
            sx={{
              width: { xs: "100%", sm: "7rem" },
              maxWidth: { xs: "14rem", sm: "7rem" },
              aspectRatio: "2 / 3",
              objectFit: "cover",
              borderRadius: 1,
              flexShrink: 0
            }}
          />
          <Stack spacing={1} minWidth={0}>
            <Typography
              variant="h6"
              title={book.title}
              sx={{
                fontWeight: 700,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {book.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(book.authors?.length ?? 0) > 0 ? book.authors.join(", ") : "Unknown Author"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {book.publishedDate && (
                <Chip
                  size="small"
                  label={formatDate(book.publishedDate)}
                  variant="outlined"
                />
              )}
              {book.pageCount ? (
                <Chip size="small" label={`${book.pageCount} pages`} variant="outlined" />
              ) : null}
              {(book.categories ?? []).slice(0, 3).map((genre: string) => (
                <Chip key={genre} size="small" label={genre} />
              ))}
            </Stack>
            {book.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {book.description.replace(/<[^>]*>?/gm, "")}
              </Typography>
            )}
          </Stack>
        </Stack>
      )}

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <PostImageUpload value={field.value} onChange={field.onChange} />
        )}
      />

      <Controller
        name="review"
        control={control}
        rules={{
          required: "Review is required",
          minLength: {
            value: REVIEW_TEXT_MIN_LENGTH,
            message: `Minimum ${REVIEW_TEXT_MIN_LENGTH} characters`,
          },
          maxLength: {
            value: REVIEW_TEXT_MAX_LENGTH,
            message: `Max ${REVIEW_TEXT_MAX_LENGTH} characters`,
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            slotProps={{ htmlInput: { maxLength: REVIEW_TEXT_MAX_LENGTH } }}
            label="Review"
            placeholder="Write your opinions on the book, help others find out if they'll like it!"
            multiline
            maxRows={10}
            fullWidth
            error={!!errors.review}
            helperText={
              errors.review
                ? errors.review.message
                : `${review?.length || 0}/${REVIEW_TEXT_MAX_LENGTH}`
            }
          />
        )}
      />

      <Controller
        name="rating"
        control={control}
        rules={{
          min: { value: RATING_STEP, message: `Rating is required (${RATING_STEP}-${RATING_MAX})` },
          max: { value: RATING_MAX, message: `Rating must be between ${RATING_MIN} and ${RATING_MAX}` },
          validate: (value) =>
            Number.isInteger(value / RATING_STEP) ||
            `Rating must use ${RATING_STEP} increments`,
        }}
        render={({ field }) => (
          <Box>
            <Typography mb={"1rem"}>Rating ({RATING_STEP}-{RATING_MAX}, half-star increments)</Typography>
            <Rating
              precision={RATING_STEP}
              value={field.value}
              onChange={(_, value) => field.onChange(value || 0)}
              max={RATING_MAX}
            />
            {errors.rating && (
              <Typography color="error" variant="caption">
                {errors.rating.message}
              </Typography>
            )}
          </Box>
        )}
      />

      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isDirty || isSaving}
        >
          {isSaving ? "Saving..." : (reviewId ? "Update" : "Publish")}
        </Button>
      </Stack>
    </Stack>
  );
};

export default NewPost;
