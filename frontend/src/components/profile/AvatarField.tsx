import { Controller, type Control } from "react-hook-form";
import ImageUpload from "../common/ImageUpload";

export default function AvatarField({ control }: { control: Control<any> }) {
  return (
    <Controller
      name="avatar"
      control={control}
      render={({ field }) => (
        <ImageUpload value={field.value} onChange={field.onChange} />
      )}
    />
  );
}
