import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import useUserStore from "@state/useUserStore";
import AvatarField from "./AvatarField";
import UsernameField from "./UsernameField";
import { UpdateUserRequestDTO } from "@shared/dtos/user.dto";
import { useState } from "react";
import { useUserApi } from "@/hooks/api/useUserApi";

interface ProfileFormProps {
  onCancel: () => void;
}

const ProfileForm = ({ onCancel }: ProfileFormProps) => {
  const { user } = useUserStore();
  const { enqueueSnackbar } = useSnackbar();
  const { updateUser } = useUserApi();
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    setError,
    formState: { isDirty, errors },
  } = useForm<UpdateUserRequestDTO>({
    defaultValues: {
      username: user.username,
      avatar: user.avatar,
    },
  });

  const onSubmit = async (data: UpdateUserRequestDTO) => {
    setLoading(true);

    try {
      if (!isDirty) return;
      await updateUser(data);
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
    } catch (error: any) {
      setError("root", {
        message: error.details.error || "Invalid details, try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AvatarField control={control} />

      <UsernameField control={control} />

      <Box display="flex" justifyContent="flex-end" gap={"1rem"} mt={"1rem"}>
        <Button onClick={onCancel} color="error">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !isDirty}
        >
          {loading ? <CircularProgress /> : "Save changes"}
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
