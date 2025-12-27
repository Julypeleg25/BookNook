import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import useUserStore from "../state/useUserStore";
import MyPostsSection from "../components/MyPostsSection";
import { bookPosts } from "../exampleData";

const Profile = () => {
  const { username, name, avatarUrl } = useUserStore();
  const postsCount = bookPosts.filter((post) => post.user.id === "u1").length;

  return (
    <div style={{ padding: "2rem", margin: "1rem" }}>
      <Card
        sx={{
          borderRadius: "1.5rem",
          padding: "1rem",
          width: "60%",
          justifySelf: "center",
        }}
      >
        <CardContent>
          <Typography
            sx={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "1rem" }}
          >
            User information
          </Typography>
          <Box justifySelf={"center"}>
            <Typography color="text.secondary" fontSize={"1.5rem"}>
              {postsCount} Post{postsCount !== 1 ? "s" : ""} | 8 Books
            </Typography>
          </Box>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Avatar
              src={avatarUrl}
              alt={name}
              sx={{ width: 100, height: 100 }}
            />
            <Button variant="outlined">change profile picture</Button>{" "}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "1.5rem",
              marginTop: "2rem",
            }}
          >
            <TextField label="Full name" value={name} fullWidth />
            <TextField label="Username" value={username} fullWidth />
          </div>
          <Button
            style={{
              width: "20%",
              marginTop: "2rem",
              display: "flex",
              justifySelf: "end",
            }}
          >
            Save changes
          </Button>
        </CardContent>
      </Card>
      <MyPostsSection postsCount={postsCount}/>
    </div>
  );
};

export default Profile;
