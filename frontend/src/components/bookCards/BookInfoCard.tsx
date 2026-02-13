import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import type { Book } from "../../models/Book";
import { formatDate } from "../../utils/dateUtils";
import { BiBookmark } from "react-icons/bi";
import { Link } from "react-router-dom";
import { LuBookCheck } from "react-icons/lu";

interface BookInfoCardProps {
  book: Book;
}

const BookInfoCard = ({ book }: BookInfoCardProps) => {
  return (
    // <Card
    //   sx={{
    //     width: "22rem",
    //     cursor: "pointer",
    //     transition: "box-shadow 0.2s ease, transform 0.2s ease",
    //     boxShadow: 1,
    //     "&:hover": {
    //       boxShadow: 6,
    //       transform: "translateY(-2px)",
    //     },
    //   }}
    // >
    //   <Link to={`/books/${book.id}`} style={{ textDecoration: "none" }}>
    //     <CardHeader
    //       action={
    //         <IconButton aria-label="settings">
    //           <CgMoreVertical />
    //         </IconButton>
    //       }
    //       // title={book.title}
    //       // subheader={book.publishedDate.toDateString()}
    //     />
    //     <CardMedia component="img" height="260rem" image={book.coverImage} />
    //     <CardContent>
    //       <Typography variant="body2" sx={{ color: "text.secondary" }}>
    //         {book.description.substring(0, 45)}...
    //       </Typography>
    //     </CardContent>
    //   </Link>
    //   <CardActions
    //     style={{
    //       justifyContent: "space-between",
    //       display: "flex",
    //       alignItems: "center",
    //       width: "100%",
    //     }}
    //   >
    //     <Chip label={book.genre}></Chip>
    //   </CardActions>
    // </Card>

    <div style={{ display: "grid", justifyItems: "center" }}>
      <Link to={`/books/${book.id}`} style={{ textDecoration: "none" }}>
        <Box
        borderRadius={'1rem'}
          width="15rem"
          height="18rem"
          sx={{
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
            boxShadow: 1,
            "&:hover": {
              boxShadow: 6,
              transform: "translateY(-2px)",
            },
          }}
        >
          <img
            style={{ borderRadius: "1rem" }}
            src={book.coverImage}
            alt={book.title}
            width="100%"
            height="100%"
          />
        </Box>
        <div style={{ display: "grid",textWrap:'balance' }}>

        <Typography variant="h6" style={{ marginTop: "0.5rem" }}>
          {book.title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {formatDate(book.publishedDate)}
        </Typography>
        </div>
      </Link>
      <div>
        <Tooltip title="Add to read list">
          <IconButton>
            <LuBookCheck />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add to wish list">
          <IconButton>
            <BiBookmark />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default BookInfoCard;
