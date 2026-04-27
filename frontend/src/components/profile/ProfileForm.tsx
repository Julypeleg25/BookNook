import { Box, Button, CircularProgress, Typography } from "@mui/material";
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
  });

  const watchedValues = watch();
  const usernameChanged = watchedValues.username.trim() !== initialValues.username;
  const avatarChanged = watchedValues.avatar instanceof File;
  const hasChanges = usernameChanged || avatarChanged;

  const onSubmit = async (data: ProfileFormValues) => {
    if (loading || !hasChanges) return;

    setLoading(true);

    try {
      await updateUser({
        ...(usernameChanged ? { username: data.username.trim() } : {}),
        ...(avatarChanged ? { avatar: data.avatar } : {}),
      });
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
      reset(data);
      onCancel();
    } catch (error: unknown) {
      setError("root", {
        message: getErrorMessage(error, "Invalid details, try again"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AvatarField control={control} />

      <Box display="flex" gap={2} mt={3}>
        <UsernameField control={control} />
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button onClick={onCancel} color="error" disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !hasChanges}
        >
          {loading ? <CircularProgress size={20} /> : "Save changes"}
        </Button>
        {errors.root && (
          <Typography color="error" variant="body2" textAlign="center">
            {errors.root.message}
          </Typography>
        )}
      </Box>
    </form>
  );
};

export default ProfileForm;
