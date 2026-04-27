import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import { useState } from "react";
import ProfileForm from "@components/profile/ProfileForm";
import ProfileView from "@components/profile/ProfileView";
import { MdEdit } from "react-icons/md";
import MyPosts from "./MyPosts";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: "2rem" }}>
      <Stack
        spacing={4}
        sx={{
          width: "100%",
          maxWidth: "900px",
          alignItems: "flex-start"
        }}
      >
        <Card
          sx={{
            borderRadius: "1.5rem",
            p: "1rem",
            width: "100%",
            boxShadow: 2,
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="1rem">
              <Typography variant="h5" fontWeight={600}>
                My information
              </Typography>
              {!isEditing && (
                <IconButton onClick={() => setIsEditing(true)}>
                  <MdEdit size="1.8rem" />
                </IconButton>
              )}
            </Box>
            {!isEditing ? <ProfileView /> : <ProfileForm onCancel={() => setIsEditing(false)} />}
          </CardContent>
        </Card>

        <Box sx={{ width: "100%" }}>
          <MyPosts disablePadding />
        </Box>
      </Stack>
    </Box>
  );
};

export default Profile;
