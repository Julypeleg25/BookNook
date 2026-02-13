import {
  Stack,
  TextField,
  Button,
  Typography,
  Box,
  Rating,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Controller,
  useForm,
  useWatch,
  type ControllerRenderProps,
} from "react-hook-form";
import PostImageUpload from "@components/common/PostImageUpload";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userReviewService } from "@/api/services/userReviewService";
import { booksService } from "@/api/services/bookService";
import { useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useEffect } from "react";

interface INewPostInputs {
  review: string;
  image: File | string;
  rating: number;
}

const NewPost = () => {
  const { bookId: routeBookId, id: reviewId } = useParams<{ bookId?: string; id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Get book from route state or fetch it
  const bookFromState = location.state?.book;

  // 1. Fetch Review if in Edit Mode
  const { data: reviewData, isLoading: isLoadingReview } = useQuery({
    queryKey: ["review", reviewId],
    queryFn: () => userReviewService.getReviewById(reviewId!),
    enabled: !!reviewId,
  });

  // Determine effective bookId
  const bookId = routeBookId || (reviewData?.book as any)?._id || (reviewData?.book as any);

  // 2. Fetch Book Data
  const { data: bookData, isLoading: isLoadingBook } = useQuery({
    queryKey: ["book", bookId],
    queryFn: async () => {
      if (!bookId || typeof bookId !== 'string') return null;
      // If we have the full book object in reviewData (populated), use it? 
      // Actually backend enrichment fix returns full object or placeholder using Google Book structure usually.
      // But standard book service expects local ID.

      const response = await booksService.getById(bookId);
      return response.book;
    },
    enabled: !!bookId && !bookFromState,
  });

  const book = bookFromState || bookData || (reviewData?.book as any);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<INewPostInputs>({
    defaultValues: {
      review: "",
      image: "",
      rating: 0,
    },
    mode: "onSubmit",
  });

  // Pre-fill form when review data loads
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
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      if (bookId) {
        queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
      }
      navigate("/posts");
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to create review",
        { variant: "error" }
      );
    },
  });

  // TODO: Add Update Mutation in userReviewService? We have updateReviewHandler in backend but service doesn't seem to have updateReview method yet?
  // Let's check service. userReviewService.ts only had: create, get..., like..., addComment. 
  // Checking userReviewController, there IS updateReviewHandler. 
  // We need to add updateReview to frontend service first? 
  // User didn't explicitly ask for update service method in the prompt, but "Edit Permission... Allow editing the post" implies it.
  // I should check userReviewService.ts content again.
  // It has create, get..., like, unlike, addComment. MISSING UPDATE.

  // For now I will stick to structure but I might need to add updateReview to service in next step if missing.
  // Assuming create for now, but really need update.

  const updateReviewMutation = useMutation({
    mutationFn: (data: { id: string; review: Partial<INewPostInputs> }) =>
      userReviewService.updateReview(data.id, {
        review: data.review.review,
        rating: data.review.rating,
        picture: data.review.image instanceof File ? data.review.image : undefined
      }),
    onSuccess: () => {
      enqueueSnackbar("Review updated successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      if (bookId) {
        queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
      }
      if (reviewId) {
        queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
      }
      navigate(`/posts/${reviewId}`);
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to update review",
        { variant: "error" }
      );
    },
  });

  const onSubmit = (data: INewPostInputs) => {
    if (!isDirty && !reviewId) return;

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
        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, border: 1, borderColor: "divider" }}>
          <Typography variant="h6">{book.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {book.authors?.join(", ")}
          </Typography>
        </Box>
      )}

      <Controller
        name="image"
        control={control}
        render={({
          field,
        }: {
          field: ControllerRenderProps<INewPostInputs, "image">;
        }) => <PostImageUpload value={field.value} onChange={field.onChange} />}
      />

      <Controller
        name="review"
        control={control}
        rules={{
          required: "Review is required",
          minLength: { value: 5, message: "Minimum 5 characters" },
          maxLength: { value: 1500, message: "Max 1500 characters" },
        }}
        render={({
          field,
        }: {
          field: ControllerRenderProps<INewPostInputs, "review">;
        }) => (
          <TextField
            {...field}
            slotProps={{ htmlInput: { maxLength: 1500 } }}
            label="Review"
            placeholder="Write your opinions on the book, help others find out if they'll like it!"
            multiline
            maxRows={10}
            fullWidth
            error={!!errors.review}
            helperText={
              errors.review
                ? errors.review.message
                : `${review?.length || 0}/1500`
            }
          />
        )}
      />

      <Controller
        name="rating"
        control={control}
        rules={{
          min: { value: 1, message: "Rating is required (1-5)" },
          max: { value: 5, message: "Rating must be between 1 and 5" },
        }}
        render={({
          field,
        }: {
          field: ControllerRenderProps<INewPostInputs, "rating">;
        }) => (
          <Box>
            <Typography mb={"1rem"}>Rating (1-5 whole numbers)</Typography>
            <Rating
              precision={1}
              value={field.value}
              onChange={(_, value) => field.onChange(value || 0)}
              max={5}
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
        <Button variant="outlined" onClick={onCancel} disabled={createReviewMutation.isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={(!isDirty && !reviewId) || createReviewMutation.isPending}
        >
          {createReviewMutation.isPending ? "Saving..." : (reviewId ? "Update" : "Publish")}
        </Button>
      </Stack>
    </Stack>
  );
};

export default NewPost;
