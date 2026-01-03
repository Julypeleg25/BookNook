import {
  Stack,
  TextField,
  Button,
  Typography,
  Box,
  Rating,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import PostImageUpload from "../components/common/PostImageUpload";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { bookPosts } from "../exampleData";
import useNav from "../hooks/useNav";

interface INewPostInputs {
  description: string;
  image: File | string;
  rating: number;
}

const NewPost = () => {
  const { id } = useParams<{ id?: string }>();
  const { goBack } = useNav();

  const bookPost = useMemo(
    () => bookPosts.find((bookPost) => bookPost.id === id),
    [id]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<INewPostInputs>({
    defaultValues: {
      description: bookPost?.description ?? "",
      image: bookPost?.imageUrl ?? "",
      rating: bookPost?.rating ?? 0,
    },
    mode: "onSubmit",
  });

  const description = useWatch({
    control,
    name: "description",
  });

  const onSubmit = (data: INewPostInputs) => {
    if (!isDirty) return;

    // TODO:
    // if (post) updatePost(post.id, data)
    // else createPost(data)

    console.log("Submitted post:", data);
    reset(data);
  };

  const onCancel = () => {
    goBack();
    reset();
  };

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
        {bookPost ? "Edit post" : "Create new post"}
      </Typography>

      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <PostImageUpload value={field.value} onChange={field.onChange} />
        )}
      />

      <Controller
        name="description"
        control={control}
        rules={{
          required: "Description is required",
          minLength: { value: 10, message: "Minimum 10 characters" },
          maxLength: { value: 1500, message: "Max 1500 characters" },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            slotProps={{ htmlInput: { maxLength: 1500 } }}
            label="Description"
            placeholder="Write your opinions on the book, help others find out if they'll like it!"
            multiline
            maxRows={10}
            fullWidth
            error={!!errors.description}
            helperText={
              errors.description
                ? errors.description.message
                : `${description?.length || 0}/1500`
            }
          />
        )}
      />

      <Controller
        name="rating"
        control={control}
        rules={{
          min: { value: 0.5, message: "Rating is required" },
        }}
        render={({ field }) => (
          <Box>
            <Typography mb={"1rem"}>Rating</Typography>
            <Rating
              precision={0.5}
              value={field.value}
              onChange={(_, value) => field.onChange(value)}
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
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={!isDirty}>
          {bookPost ? "Save changes" : "Publish"}
        </Button>
      </Stack>
    </Stack>
  );
};

export default NewPost;
