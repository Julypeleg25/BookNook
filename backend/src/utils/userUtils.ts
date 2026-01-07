export const generateUsernameFromEmail = (email: string): string => {
  const prefix = email.split('@')[0];
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNumber}`;
};