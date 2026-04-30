import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useForm, useWatch } from "react-hook-form";
import { booksService } from "@/api/services/bookService";
import { userReviewService } from "@/api/services/userReviewService";
import { getErrorMessage } from "@/api/apiError";
import { invalidateReviewCaches } from "@/api/queryCache";
import { queryKeys } from "@/api/queryKeys";
import type {
  PostFormLocationState,
  PostFormValues,
  UpdateReviewFormData,
} from "@/models/PostForm";
import { isAllowedRating, normalizeRating } from "@components/postForm/ratingUtils";

export const useReviewFormPage = () => {
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

  const form = useForm<PostFormValues>({
    defaultValues: {
      review: "",
      image: "",
      rating: 0,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const {
    control,
    formState: { isDirty, isValid },
    reset,
  } = form;

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
        { variant: "error" },
      );
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: (data: UpdateReviewFormData) =>
      userReviewService.updateReview(data.id, {
        review: data.review.review,
        rating: data.review.rating,
        picture: data.review.image instanceof File ? data.review.image : undefined,
      }),
    onSuccess: () => {
      enqueueSnackbar("Review updated successfully!", { variant: "success" });
      invalidateReviewCaches(queryClient, { bookId, reviewId });
      navigate(`/posts/${reviewId}`);
    },
    onError: (error: unknown) => {
      enqueueSnackbar(
        getErrorMessage(error, "Failed to update review"),
        { variant: "error" },
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
    if (!isAllowedRating(normalizedRating)) return;

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
      return;
    }

    if (!bookId) return;
    createReviewMutation.mutate({
      bookId,
      rating: normalizedRating,
      review: data.review,
      picture: data.image instanceof File ? data.image : undefined,
    });
  };

  const onCancel = () => {
    navigate(-1);
    reset();
  };

  return {
    book,
    bookId,
    canSubmit,
    form,
    isLoading: isLoadingBook || isLoadingReview,
    isLoadingReview,
    isSaving,
    onCancel,
    onSubmit,
    reviewId,
    reviewLength,
  };
};
