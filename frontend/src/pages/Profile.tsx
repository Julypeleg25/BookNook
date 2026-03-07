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
import ProfileForm from "@components/profile/ProfileForm";
import ProfileView from "@components/profile/ProfileView";
import { MdEdit } from "react-icons/md";
import MyPosts from "./MyPosts";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);


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
                My information
              </Typography>

             
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
      <MyPosts/>
    </Stack>
  );
};

export default Profile;
