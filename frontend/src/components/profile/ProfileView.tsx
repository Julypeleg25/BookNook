import useUserStore from "@/state/useUserStore";
import { Box, Typography, Avatar } from "@mui/material";

const ProfileView = () => {
  const { user } = useUserStore();

  return (
    <Box display="flex" gap={"1rem"} alignItems="center">
      <Avatar src={user.avatar} sx={{ width: "4rem", height: "4rem" }} />
      <Box>
        <Typography color="text.secondary">@{user.username}</Typography>
      </Box>
    </Box>
  );
};

export default ProfileView;
