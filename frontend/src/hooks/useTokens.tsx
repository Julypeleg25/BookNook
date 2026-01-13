
function useTokens() {
  const getTokens = () => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  });

  const setAccessToken = (
    accessToken: string,
  ) => {
    localStorage.setItem('accessToken', accessToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
};

  return { getTokens, setAccessToken, clearTokens };
}

export default useTokens;