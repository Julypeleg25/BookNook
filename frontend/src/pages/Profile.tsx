import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import { useState } from "react";
import useUserStore from "@state/useUserStore";
import ProfileForm from "@components/profile/ProfileForm";
import ProfileView from "@components/profile/ProfileView";
import { MdEdit } from "react-icons/md";
import MyPostsSection from "@components/profile/MyPostsSection";
import { bookPosts } from "../exampleData";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const postsCount = bookPosts.filter((post) => post.user.id === "u1").length;

  return (
    <Stack justifySelf="center" margin="1rem">
      <Card
        sx={{
          borderRadius: "1.5rem",
          p: "1rem",
          maxWidth: "40%",
          width: "40rem",
        }}
      >
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="1rem"
          >
            <Box>
              <Typography fontSize="1.4rem" fontWeight={600}>
                User information
              </Typography>

              {!isEditing && (
                <Stack direction="row" spacing="0.5rem" mt="1rem">
                  <Typography variant="body2" color="text.secondary">
                    <strong>{postsCount}</strong> Posts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>8</strong> Books
                  </Typography>
                </Stack>
              )}
            </Box>

            {!isEditing && (
              <Tooltip title="edit profile">
                <IconButton onClick={() => setIsEditing(true)}>
                  <MdEdit size="2rem" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {!isEditing ? (
            <ProfileView />
          ) : (
            <ProfileForm onCancel={() => setIsEditing(false)} />
          )}
        </CardContent>
      </Card>
      <MyPostsSection postsCount={postsCount} />
    </Stack>
  );
};

export default Profile;
