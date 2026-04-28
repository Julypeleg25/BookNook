import {
  Alert,
  Box,
  CircularProgress,
  Chip,
  LinearProgress,
  Divider,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Controller,
  useForm,
  useWatch,
} from "react-hook-form";
import PostImageUpload from "@components/common/PostImageUpload";
import BookReferenceCard from "@components/postForm/BookReferenceCard";
import PostPublishSection from "@components/postForm/PostPublishSection";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import { booksService } from "@/api/services/bookService";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
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

const RATING_EPSILON = 1e-8;
const EMPTY_RATING = 0;
const MIN_SELECTABLE_RATING = RATING_STEP;

const normalizeRating = (value: unknown): number => {
  const numericRating = Number(value);
  return Number.isFinite(numericRating) ? numericRating : EMPTY_RATING;
};

const isRatingStepAligned = (value: number): boolean =>
  Math.abs(value / RATING_STEP - Math.round(value / RATING_STEP)) < RATING_EPSILON;

const isAllowedRating = (value: unknown): boolean => {
  const numericRating = normalizeRating(value);
  return (
    numericRating >= MIN_SELECTABLE_RATING &&
    numericRating <= RATING_MAX &&
    isRatingStepAligned(numericRating)
  );
};

const validateRating = (value: unknown): true | string => {
  const numericRating = normalizeRating(value);

  if (numericRating < MIN_SELECTABLE_RATING) {
    return `Choose a rating from ${MIN_SELECTABLE_RATING} to ${RATING_MAX}`;
  }

  if (numericRating > RATING_MAX || numericRating < RATING_MIN) {
    return `Rating must be between ${RATING_MIN} and ${RATING_MAX}`;
  }

  return isRatingStepAligned(numericRating) || `Rating must use ${RATING_STEP} increments`;
};

const formatRatingValue = (value: number): string => value.toFixed(1);

interface RatingCardProps {
  value: number;
  error?: string;
  onBlur: () => void;
  onChange: (value: number) => void;
}

const RatingCard = ({ value, error, onBlur, onChange }: RatingCardProps) => {
  const hasRating = value >= MIN_SELECTABLE_RATING;
  const displayValue = hasRating ? formatRatingValue(value) : "--";

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: error ? "error.main" : hasRating ? "primary.main" : "divider",
        borderRadius: 2,
        p: 2,
        bgcolor: hasRating ? "rgba(91, 111, 106, 0.06)" : "rgba(91, 111, 106, 0.025)",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 1.25,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5}>
        <Box>
          <Typography fontWeight={800}>Your Rating</Typography>
          <Typography variant="body2" color="text.secondary">
            Pick a score.
          </Typography>
        </Box>
        <Box
          sx={{
            minWidth: "3.75rem",
            px: 1.25,
            py: 0.6,
            borderRadius: 2,
            bgcolor: hasRating ? "primary.main" : "background.paper",
            color: hasRating ? "primary.contrastText" : "text.primary",
            border: "1px solid",
            borderColor: hasRating ? "primary.main" : "divider",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" fontWeight={900} lineHeight={1}>
            {displayValue}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            / {RATING_MAX}
          </Typography>
        </Box>
      </Stack>

      <Rating
        precision={RATING_STEP}
        value={hasRating ? value : null}
        onChange={(_, nextValue) => onChange(normalizeRating(nextValue))}
        onBlur={onBlur}
        max={RATING_MAX}
        sx={{
          alignSelf: "center",
          "& .MuiRating-icon": {
            fontSize: { xs: "2rem", sm: "2.15rem" },
          },
          "& .MuiRating-iconFilled": {
            color: "primary.main",
          },
          "& .MuiRating-iconHover": {
            color: "primary.dark",
          },
        }}
      />

      <Typography
        variant="body2"
        color={error ? "error" : "text.secondary"}
        sx={{ minHeight: "1.25rem" }}
      >
        {error ?? (hasRating ? "Rating selected." : "Required before publishing.")}
      </Typography>
    </Box>
  );
};

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
    enabled: !!bookId,
  });

  const book = bookData || (typeof reviewData?.book === "object" ? reviewData.book : null) || bookFromState || null;

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<PostFormValues>({
    defaultValues: {
      review: "",
      image: "",
      rating: 0,
    },
    mode: "onChange",
    reValidateMode: "onChange",
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
  const image = useWatch({
    control,
    name: "image",
  });
  const rating = useWatch({
    control,
    name: "rating",
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
  const hasImage = image instanceof File || (typeof image === "string" && image.trim().length > 0);
  const reviewLength = review?.length || 0;
  const canSubmit = isDirty && isValid && hasImage && isAllowedRating(rating) && !isSaving;

  const onSubmit = (data: PostFormValues) => {
    if (isSaving) return;

    const normalizedRating = normalizeRating(data.rating);
    if (!isAllowedRating(normalizedRating)) {
      return;
    }

    if (!hasImage) {
      enqueueSnackbar("Please upload an image before publishing.", { variant: "error" });
      return;
    }

    if (reviewId) {
      updateReviewMutation.mutate({
        id: reviewId,
        review: {
          ...data,
          rating: normalizedRating,
        },
      });
    } else {
      if (!bookId) return;
      createReviewMutation.mutate({
        bookId,
        rating: normalizedRating,
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

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Post Setup
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add the image and rating for this review.
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 18rem" },
                gap: 2.5,
                alignItems: "stretch",
              }}
            >
              <Controller
                name="image"
                control={control}
                rules={{
                  validate: (value) =>
                    (value instanceof File ||
                      (typeof value === "string" && value.trim().length > 0)) ||
                    "An image is required for every post",
                }}
                render={({ field }) => (
                  <PostImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.image}
                    helperText={errors.image?.message}
                  />
                )}
              />

              <Stack spacing={2} justifyContent="stretch">
                <Controller
                  name="rating"
                  control={control}
                  rules={{
                    validate: validateRating,
                  }}
                  render={({ field, fieldState }) => (
                    <RatingCard
                      value={normalizeRating(field.value)}
                      error={fieldState.error?.message}
                      onBlur={field.onBlur}
                      onChange={(nextRating) => field.onChange(nextRating)}
                    />
                  )}
                />
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Write Review
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share what worked, what stood out, and who might enjoy it.
                </Typography>
              </Box>
              <Chip
                label={`${reviewLength}/${REVIEW_TEXT_MAX_LENGTH}`}
                variant="outlined"
                size="small"
              />
            </Stack>

            <Divider />

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
                  placeholder="What stood out, who is this book for, and how did it make you feel?"
                  multiline
                  minRows={7}
                  maxRows={14}
                  fullWidth
                  error={!!errors.review}
                  helperText={
                    errors.review
                      ? errors.review.message
                      : reviewLength < REVIEW_TEXT_MIN_LENGTH
                        ? `Minimum ${REVIEW_TEXT_MIN_LENGTH} characters`
                        : `${reviewLength}/${REVIEW_TEXT_MAX_LENGTH}`
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      alignItems: "flex-start",
                    },
                  }}
                />
              )}
            />
          </Stack>
        </Paper>

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
