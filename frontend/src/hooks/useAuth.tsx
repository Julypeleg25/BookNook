import { useNavigate } from "react-router-dom";
import useUserStore from "@/state/useUserStore";
import { AuthService } from "@/api/services/authService";
import { RegisterRequestDTO, LoginRequestDTO } from "@shared/dtos/auth.dto";
import { tokenService } from "@/api/services/tokenService";

export const useAuth = () => {
  const navigate = useNavigate();
  const { setUser, resetUser } = useUserStore();

  const login = async (payload: LoginRequestDTO) => {
    const data = await AuthService.login(payload);

    tokenService.setAccess(data.accessToken);
    setUser(data.user);
    navigate("/posts");
  };

  const register = async (payload: RegisterRequestDTO) => {
    const data = await AuthService.register(payload);

    tokenService.setAccess(data.accessToken);
    setUser(data.user);
    navigate("/posts");
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      tokenService.clear();
      resetUser();
      navigate("/login");
    }
  };

  const syncUser = async () => {
    const token = tokenService.getAccess();

    if (!token) {
      resetUser();
      navigate("/login");
      return;
    }

    try {
      const user = await AuthService.getCurrentUser();
      setUser(user);
    } catch {
      tokenService.clear();
      resetUser();
    }
  };

  return { login, register, logout, syncUser };
};
