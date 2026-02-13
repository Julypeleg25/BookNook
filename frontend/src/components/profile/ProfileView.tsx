import { Box, Typography, Avatar } from "@mui/material";

interface Props {
  name: string;
  username: string;
  avatar: string | null;
}

const ProfileView = ({ name, username, avatar }: Props) => {
  return (
    <Box display="flex" gap={3} alignItems="center">
      <Avatar src={avatar || undefined} sx={{ width: 80, height: 80 }} />

      <Box>
        <Typography fontWeight={600}>{name}</Typography>
        <Typography color="text.secondary">@{username}</Typography>
      </Box>
    </Box>
  );
};

export default ProfileView;
