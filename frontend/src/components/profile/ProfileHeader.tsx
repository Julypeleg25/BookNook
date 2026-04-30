import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FiMail } from "react-icons/fi";
import { MdEdit } from "react-icons/md";
import { getAvatarSrcUrl } from "@/utils/userUtils";
import type { User } from "@/models/User";

interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  onEditClick: () => void;
}

export const ProfileHeader = ({
  user,
  isEditing,
  onEditClick,
}: ProfileHeaderProps) => (
  <Stack
    direction={{ xs: "column", md: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", md: "center" }}
    gap={3}
  >
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2.5}
      alignItems={{ xs: "flex-start", sm: "center" }}
    >
      <Avatar
        src={getAvatarSrcUrl(user.avatar)}
        sx={{
          width: { xs: "5rem", md: "6rem" },
          height: { xs: "5rem", md: "6rem" },
          border: "4px solid",
          borderColor: "background.paper",
          boxShadow: "0 14px 30px rgba(31, 41, 51, 0.16)",
        }}
      />
      <Box minWidth={0}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ overflowWrap: "anywhere" }}
        >
          {user.username || "BookNook reader"}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 1 }}
        >
          <Chip label={`@${user.username || "reader"}`} size="small" />
          {user.email && (
            <Chip
              icon={<FiMail size={15} />}
              label={user.email}
              size="small"
              variant="outlined"
              sx={{
                maxWidth: "100%",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          )}
        </Stack>
      </Box>
    </Stack>

    {!isEditing && (
      <IconButton
        onClick={onEditClick}
        aria-label="Edit profile"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <MdEdit size="1.4rem" />
      </IconButton>
    )}
  </Stack>
);
