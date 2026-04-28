import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import useUserStore from "@state/useUserStore";
import AvatarField from "./AvatarField";
import UsernameField from "./UsernameField";
import { useState } from "react";
import { useUserApi } from "@/hooks/useUserApi";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import type { ProfileFormProps, ProfileFormValues } from "@/models/ProfileForm";
import { getErrorMessage } from "@/api/apiError";

const ProfileForm = ({ onCancel }: ProfileFormProps) => {
  const { user } = useUserStore();
  const { enqueueSnackbar } = useSnackbar();
  const { updateUser } = useUserApi();
  const [loading, setLoading] = useState(false);
  const initialValues: ProfileFormValues = {
    username: user.username,
    avatar: getAvatarSrcUrl(user.avatar) ?? "",
  };

  const {
    handleSubmit,
    control,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: initialValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const watchedValues = watch();
  const trimmedUsername = watchedValues.username.trim();
  const usernameChanged = trimmedUsername !== initialValues.username;
  const avatarChanged = watchedValues.avatar instanceof File;
  const hasChanges = usernameChanged || avatarChanged;

  const onSubmit = async (data: ProfileFormValues) => {
    if (loading || !hasChanges) return;

    const username = data.username.trim();
    if (!username) {
      setError("username", { message: "Username is required" });
      return;
    }

    setLoading(true);

    try {
      await updateUser({
        ...(usernameChanged ? { username } : {}),
        ...(avatarChanged ? { avatar: data.avatar } : {}),
      });
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
      reset({ ...data, username });
      onCancel();
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Invalid details, try again");
      if (message.toLowerCase().includes("username")) {
        setError("username", { message });
        return;
      }
      setError("root", {
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {errors.root && (
          <Alert severity="error">
            {errors.root.message}
          </Alert>
        )}

        <AvatarField control={control} disabled={loading} />

        <UsernameField control={control} disabled={loading} />

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
          flexDirection={{ xs: "column", sm: "row" }}
        >
          <Typography variant="body2" color="text.secondary">
            Changes are saved to your public profile.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button onClick={onCancel} variant="outlined" disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !hasChanges || !!errors.username || !trimmedUsername}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Save changes"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </form>
  );
};

export default ProfileForm;
