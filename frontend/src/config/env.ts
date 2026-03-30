const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!googleClientId) {
  throw new Error(
    "Missing required environment variable VITE_GOOGLE_CLIENT_ID. Add it to .env and restart the dev server."
  );
}

const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  GOOGLE_CLIENT_ID: googleClientId,
};

export default env;
