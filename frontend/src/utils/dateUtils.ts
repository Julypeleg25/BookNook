export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days <= 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-GB");
}

const timeOfDay = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  EVENING: "evening",
} as const;
export type TimeOfDay = (typeof timeOfDay)[keyof typeof timeOfDay];

export const getTimeOfDay = (): string => {
  const now = new Date();
  const hours = now.getHours();

  if (hours < 12) {
    return timeOfDay.MORNING;
  } else if (hours < 18) {
    return timeOfDay.AFTERNOON;
  } else {
    return timeOfDay.EVENING;
  }
};
