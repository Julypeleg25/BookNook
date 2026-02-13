import { useNavigate } from "react-router-dom";

const useNav = () => {
  const navigate = useNavigate();

  const isBackPossible = window.history.length > 1;

   const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/lists");
    }
  };

  return { goBack, isBackPossible };
};

export default useNav;
