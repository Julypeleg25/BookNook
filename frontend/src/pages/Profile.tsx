import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ImageUpload from "../components/ImageUpload";
import MyPostsSection from "../components/MyPostsSection";
import useUserStore from "../state/useUserStore";
import { bookPosts } from "../exampleData";
import { useSnackbar } from "notistack";

interface IProfileInputs {
  name: string;
  username: string;
  avatar: File | string | null;
}

const Profile = () => {
  const { username, name, avatar, setName, setUsername, setAvatar } =
    useUserStore();
  const { enqueueSnackbar } = useSnackbar();
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<IProfileInputs>({
    defaultValues: {
      name: name,
      username: username,
      avatar: avatar,
    },
  });

  const postsCount = bookPosts.filter((post) => post.user.id === "u1").length;

  const onSubmit = async (data: IProfileInputs) => {
    if (isDirty) {
      if (dirtyFields.name) {
        setName(data.name);
      }
      if (dirtyFields.username) {
        setUsername(data.username);
      }

      if (data.avatar instanceof File && dirtyFields.avatar) {
        // const formData = new FormData();
        // formData.append('file', data.avatar);
        // const response = await uploadApi(formData);
        // setAvatar(response.url);

        // For local demo/testing:
        const localPreviewUrl = URL.createObjectURL(data.avatar);
        setAvatar(localPreviewUrl);
      }

      enqueueSnackbar("Profile updated successfully!", {
        variant: "success",
      });
    }
  };

  return (
    <div style={{ padding: "2rem", margin: "1rem" }}>
      <Card
        sx={{
          borderRadius: "1.5rem",
          padding: "1rem",
          width: "95%",
        }}
      >
        <CardContent>
          <Typography
            sx={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "1rem" }}
          >
            User information
          </Typography>

          <Box sx={{ mb: "1rem" }}>
            <Typography color="text.secondary" fontSize={"1.1rem"}>
              {postsCount} Post{postsCount !== 1 ? "s" : ""} | 8 Books
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ marginBottom: "2rem" }}>
              <Controller
                name="avatar"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={(file) => field.onChange(file)}
                  />
                )}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: "1.5rem",
                marginTop: "2rem",
              }}
            >
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "Name is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                  maxLength: { value: 14, message: "Maximum 14 characters" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="username"
                control={control}
                rules={{
                  required: "Username is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                  maxLength: { value: 14, message: "Maximum 14 characters" },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    fullWidth
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!isDirty}
                sx={{
                  padding: "10px 30px",
                  borderRadius: "10px",
                  textTransform: "none",
                }}
              >
                Save changes
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Box sx={{ mt: "1rem" }}>
        <MyPostsSection postsCount={postsCount} />
      </Box>
    </div>
  );
};

export default Profile;
