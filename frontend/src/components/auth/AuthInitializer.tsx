import { useEffect, useState } from "react";
import { useAuth } from "@hooks/useAuth";

export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { syncUser  } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
        try{
            await syncUser();
        } finally{
         setLoading(false);

        }
    };
    init();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};