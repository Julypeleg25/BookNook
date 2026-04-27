export interface ProfileFormValues {
  username: string;
  avatar: File | string;
}

export interface ProfileFormProps {
  onCancel: () => void;
}
