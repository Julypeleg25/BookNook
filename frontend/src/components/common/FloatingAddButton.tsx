import { Fab } from "@mui/material";
import { HiPlus } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const FloatingAddButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/books/select");
    };

    return (
        <Fab
            color="primary"
            aria-label="create post"
            onClick={handleClick}
            sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 1000,
            }}
        >
            <HiPlus size={24} />
        </Fab>
    );
};

export default FloatingAddButton;
