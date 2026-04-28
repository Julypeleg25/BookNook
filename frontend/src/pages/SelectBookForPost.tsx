import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ExploreBooks from "./ExploreBooks";
import type { Book } from "@/models/Book";

const SelectBookForPost = () => {
    const navigate = useNavigate();

    const handleBookSelect = (book: Book) => {
        navigate(`/post/create/${book.id}`, { state: { book } });
    };

    return (
        <Box>
            <Box sx={{ p: 3, pb: 0 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    Select a Book to Review
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Search for the book you want to review, then click Write Review.
                </Typography>
            </Box>
            <ExploreBooks
                isSelectMode={true}
                onBookSelect={handleBookSelect}
            />
        </Box>
    );
};

export default SelectBookForPost;
