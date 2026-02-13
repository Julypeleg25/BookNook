import FullBookPostCard from "../components/bookCards/FullBookPostCard";
import { bookPosts } from "../exampleData";
import myPostsIcon from "../assets/posts-page.png";

const user_id = "u1"; //TODO: Example user ID
const exampleUserPosts = bookPosts
  .filter((post) => post.user.id === user_id)
  .slice(0, 5);

const MyPosts = () => {
  return (
    <div
      style={{
        padding: "1rem",
        margin: "1.2rem",
        display: "grid",
        gap: "2rem",
        borderRadius: "1rem",
        maxWidth: "80%",
        width: "70rem",
      }}
    >
      <h2>My posts</h2>

      <img
        src={myPostsIcon}
        style={{
          position: "absolute",
          transform: "scaleX(-1)",
          top: 120,
          right: 150,
        }}
      />
      {exampleUserPosts.map((post) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            fontSize: "1rem",
            fontWeight: "500",
          }}
          key={post.id}
        >
          <FullBookPostCard key={post.id} post={post} />
        </div>
      ))}
    </div>
  );
};
export default MyPosts;
