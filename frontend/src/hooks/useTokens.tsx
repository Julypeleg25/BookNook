import { tokenService } from "@/api/services/tokenService";

interface TokensState {
  accessToken: string | null;
  refreshToken: string | null;
}

const useTokens = () => {
  const getTokens = (): TokensState => ({
    accessToken: tokenService.getAccess(),
    refreshToken: tokenService.getRefresh(),
  });

  const setAccessToken = (accessToken: string): void => {
    tokenService.setAccess(accessToken);
  };

  const clearTokens = (): void => {
    tokenService.clear();
  };

  return { getTokens, setAccessToken, clearTokens };
};

export default useTokens;