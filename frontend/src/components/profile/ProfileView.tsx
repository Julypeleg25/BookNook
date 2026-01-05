import useUserStore from "@/state/useUserStore";
import { Box, Typography, Avatar } from "@mui/material";

const ProfileView = () => {
  const { user } = useUserStore();

  return (
    <Box display="flex" gap={3} alignItems="center">
      <Avatar src={user.avatar} sx={{ width: "4rem", height: "4rem" }} />
      <Box>
        <Typography fontWeight={600}>{user.name}</Typography>
        <Typography color="text.secondary">@{user.username}</Typography>
      </Box>
    </Box>
  );
};

export default ProfileView;
