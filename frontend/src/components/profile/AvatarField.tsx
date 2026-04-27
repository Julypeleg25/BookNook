import { Controller, type Control } from "react-hook-form";
import ImageUpload from "../common/ImageUpload";
import type { ProfileFormValues } from "@/models/ProfileForm";

interface AvatarFieldProps {
  control: Control<ProfileFormValues>;
}

const AvatarField = ({ control }: AvatarFieldProps) => {
  return (
    <Controller
      name="avatar"
      control={control}
      render={({ field }) => (
        <ImageUpload value={field.value} onChange={field.onChange} />
      )}
    />
  );
};

export default AvatarField;
