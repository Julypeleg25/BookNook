import { Controller, type Control, type FieldValues } from "react-hook-form";
import ImageUpload from "../common/ImageUpload";

const AvatarField = ({ control }: { control: Control<FieldValues> }) => {
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
