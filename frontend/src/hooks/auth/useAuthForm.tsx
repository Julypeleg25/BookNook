import { useState } from "react";


const useAuthForm = () =>  {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  return {
    showPassword,
    togglePassword: () => setShowPassword((p) => !p),
    loading,
    setLoading,
  };
}

export default useAuthForm;
