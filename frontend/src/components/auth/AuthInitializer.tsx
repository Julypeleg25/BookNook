import { useEffect, useState } from "react";
import { useAuth } from "@hooks/useAuth";
import { Box } from "@mui/material";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { syncUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await syncUser();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [syncUser]);

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return <>{children}</>;
};
