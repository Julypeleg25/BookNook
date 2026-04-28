export interface ProfileFormValues {
  username: string;
  avatar: File | string | null;
}

export interface ProfileFormProps {
  onCancel: () => void;
}
