import FullBookPostCard from "../components/bookCards/FullBookPostCard";
import { bookPosts } from "../exampleData";

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
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        backgroundColor: "white",
        borderRadius: "1rem",
        width: "80%",
        justifyContent: "center",
        justifyItems: "center",
        justifySelf: "center",
      }}
    >
      <h2>My posts</h2>
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
