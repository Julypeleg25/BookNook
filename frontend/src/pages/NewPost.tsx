import {
  Alert,
  Button,
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
import type { SyntheticEvent } from "react";
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
    setValue,
    clearErrors,
    formState: { errors, isDirty, isSubmitted, isValid },
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
  const isValidRating = (value: unknown) => {
    const numericRating = Number(value);
    return (
      Number.isFinite(numericRating) &&
      numericRating >= RATING_STEP &&
      numericRating <= RATING_MAX &&
      Math.abs(numericRating / RATING_STEP - Math.round(numericRating / RATING_STEP)) < 1e-8
    );
  };
  const canSubmit = isDirty && isValid && hasImage && isValidRating(rating) && !isSaving;

  const onSubmit = (data: PostFormValues) => {
    if (isSaving) return;

    const normalizedRating = Number(data.rating);
    if (
      Number.isNaN(normalizedRating) ||
      normalizedRating < RATING_STEP ||
      normalizedRating > RATING_MAX ||
      !isValidRating(normalizedRating)
    ) {
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
      <Stack spacing={3} maxWidth="76rem" mx="auto">
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
          <Stack spacing={0.75} maxWidth="44rem">
            <Typography variant="h4" fontWeight={800}>
              {reviewId ? "Edit Post" : "Create Post"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Pair your review with a real image, a clear rating, and enough context for other readers to decide.
            </Typography>
          </Stack>
        </Stack>

        {book && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, md: 3 }}
              alignItems={{ xs: "stretch", sm: "stretch" }}
            >
              <Box
                sx={{
                  width: { xs: "100%", sm: "12rem", md: "14rem" },
                  maxWidth: { xs: "18rem", sm: "12rem", md: "14rem" },
                  minHeight: { sm: "18rem" },
                  borderRadius: 2,
                  flexShrink: 0,
                  overflow: "hidden",
                  bgcolor: "grey.100",
                  boxShadow: "0 16px 36px rgba(31, 41, 51, 0.16)",
                  alignSelf: { xs: "center", sm: "stretch" },
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
                    pointerEvents: "none",
                  },
                }}
              >
                <Box
                  component="img"
                  src={getAvatarSrcUrl(book.thumbnail)}
                  onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x450?text=No+Cover";
                  }}
                  alt={book.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: { xs: "20rem", sm: "100%" },
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
              <Stack spacing={1.4} minWidth={0} justifyContent="center" flex={1}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0, fontWeight: 800 }}>
                  Book Reference
                </Typography>
                <Typography
                  variant="h5"
                  title={book.title}
                  sx={{
                    fontWeight: 800,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {book.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
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
                  <Box
                    sx={{
                      mt: 0.5,
                      pt: 1.5,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      Description
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: { xs: 5, md: 7 },
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.7,
                      }}
                    >
                      {book.description.replace(/<[^>]*>?/gm, "")}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Stack>
          </Paper>
        )}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={3}>
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
                  Choose the visual and rating first, then write the review below.
                </Typography>
              </Box>
           </Stack>

            <Divider />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.15fr) minmax(20rem, 0.85fr)" },
                gap: 3,
                alignItems: "start",
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

              <Stack spacing={2}>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: { xs: 2, md: 2.5 },
                    bgcolor: "rgba(91, 111, 106, 0.035)",
                  }}
                >
                  <Controller
                    name="rating"
                    control={control}
                    rules={{
                      validate: (value) => {
                        const numericRating = Number(value);
                        if (!Number.isFinite(numericRating) || numericRating < RATING_STEP) {
                          return `Rating is required (${RATING_STEP}-${RATING_MAX})`;
                        }
                        if (numericRating > RATING_MAX) {
                          return `Rating must be between ${RATING_MIN} and ${RATING_MAX}`;
                        }
                        return isValidRating(numericRating) || `Rating must use ${RATING_STEP} increments`;
                      },
                    }}
                    render={({ field }) => (
                      <Box>
                        <Typography mb={1} fontWeight={800}>
                          Rating
                        </Typography>
                        <Rating
                          precision={RATING_STEP}
                          value={Number(field.value) || 0}
                          onChange={(_, value) => {
                            const nextRating = Number(value ?? 0);
                            field.onChange(nextRating);
                            setValue("rating", nextRating, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                            if (isValidRating(nextRating)) {
                              clearErrors("rating");
                            }
                          }}
                          max={RATING_MAX}
                          sx={{
                            "& .MuiRating-icon": {
                              fontSize: { xs: "2rem", sm: "2.2rem" },
                            },
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {Number(field.value) > 0
                            ? `${Number(field.value).toFixed(1)} / ${RATING_MAX}`
                            : "Choose a rating"}
                        </Typography>
                        {errors.rating && (
                          <Typography color="error" variant="caption">
                            {errors.rating.message}
                          </Typography>
                        )}
                      </Box>
                    )}
                  />
                </Box>

                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: { xs: 2, md: 2.5 },
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography fontWeight={800}>Publish</Typography>
                    </Box>

                    <Stack spacing={1.25}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={!canSubmit}
                        fullWidth
                        size="large"
                      >
                        {isSaving ? "Saving..." : (reviewId ? "Update Post" : "Publish Post")}
                      </Button>
                      <Button variant="outlined" onClick={onCancel} disabled={isSaving} fullWidth>
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Write Your Review
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add a useful opinion, not just a summary.
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
                  minRows={9}
                  maxRows={16}
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
      </Stack>
    </Box>
  );
};

export default NewPost;
