import { Fab } from "@mui/material";
import { HiPlus } from "react-icons/hi2";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";

const FloatingAddButton = () => {
    const { navigateProtected } = useProtectedNavigation();

    const handleClick = () => {
        navigateProtected("/books/select");
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
