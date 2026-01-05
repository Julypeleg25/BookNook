import { Box, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import useUserStore from "@state/useUserStore";
import AvatarField from "./AvatarField";
import NameField from "./NameField";
import UsernameField from "./UsernameField";

interface Props {
  onCancel: () => void;
}

interface IProfileInputs {
  name: string;
  username: string;
  avatar: File | string | null;
}

const ProfileForm = ({ onCancel }: Props) => {
  const { user } = useUserStore();
  const { enqueueSnackbar } = useSnackbar();

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty, dirtyFields },
  } = useForm<IProfileInputs>({
    defaultValues: {
      name: user.name,
      username: user.username,
      avatar: user.avatar,
    },
  });

  const onSubmit = (data: IProfileInputs) => {
    if (!isDirty) return;

    // if (dirtyFields.name) setName(data.name);
    // if (dirtyFields.username) setUsername(data.username);

    // if (dirtyFields.avatar && data.avatar instanceof File) {
    //   setAvatar(URL.createObjectURL(data.avatar));
    // }

    enqueueSnackbar("Profile updated successfully!", { variant: "success" });
    reset(data);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AvatarField control={control} />

      <Box display="flex" gap={2} mt={3}>
        <NameField control={control} />
        <UsernameField control={control} />
      </Box>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button onClick={onCancel} color="error">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={!isDirty}>
          Save changes
        </Button>
      </Box>
    </form>
  );
};

export default ProfileForm;
