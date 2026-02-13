import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  TextField,
} from "@mui/material";
import Select from "../Select";
import SearchFiltersToggleButtonGroup from "./SearchFiltersToggleButtonGroup";
import { Controller, useForm } from "react-hook-form";
import {
  genreMenuItems,
  languageMenuItems,
  likesMenuItems,
  reviewsMenuItems,
  yearFieldRules,
  type ISearchFiltersForm,
} from "./models/SearchFiltersOptions";

interface SearchFiltersModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchFiltersModal = (props: SearchFiltersModalProps) => {
  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<ISearchFiltersForm>({
    defaultValues: {
      language: "",
      genre: "",
      author: "",
      yearPublishedFrom: "",
      yearPublishedTo: "",
      likesAmount: "",
      reviewsAmount: "",
      rating: 0,
    },
    mode: "onSubmit",
  });

  const onSubmit = (data: ISearchFiltersForm) => {
    console.log(data);
    if (data.yearPublishedFrom > data.yearPublishedTo) {
      return;
    }
  };

  const onCancel = () => reset();

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <form onSubmit={handleSubmit(onSubmit)} onReset={onCancel}>
        <DialogTitle>Search Filters</DialogTitle>
        <DialogContent style={{ marginTop: "0.5rem" }}>
          <div
            style={{
              marginTop: "1.3rem",
              justifyContent: "space-between",
              display: "flex",
            }}
          >
            <Select
              menuItems={languageMenuItems}
              style={{ minWidth: "16rem" }}
              label="Language"
              selectedValues={[]}
              onChange={() => {}}
            />
            <Select
              menuItems={genreMenuItems}
              label="Genre"
              selectedValues={[]}
              style={{ minWidth: "16rem" }}
              onChange={() => {}}
            />
          </div>
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Controller
              name="author"
              control={control}
              rules={{
                minLength: { value: 3, message: "Minimum 3 characters" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  helperText={errors.author?.message}
                  error={!!errors.author}
                  label="Author"
                  style={{ marginTop: "1.5rem", width: "16rem" }}
                />
              )}
            />
            <div>
              Year published
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginRight: "3rem",
                }}
              >
                <Controller
                  name="yearPublishedFrom"
                  control={control}
                  rules={{
                    ...yearFieldRules,
                    validate: (value) => {
                      const toYear = getValues("yearPublishedTo");
                      if (toYear !== undefined && value > toYear) {
                        return "Years not valid";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      helperText={errors.yearPublishedFrom?.message}
                      error={!!errors.yearPublishedFrom}
                      style={{ width: "5rem" }}
                    />
                  )}
                />
                to
                <Controller
                  name="yearPublishedTo"
                  control={control}
                  rules={{
                    ...yearFieldRules,
                    validate: (value) => {
                      const fromYear = getValues("yearPublishedFrom");
                      if (fromYear !== undefined && value < fromYear) {
                        return "Years not valid";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      helperText={errors.yearPublishedTo?.message}
                      error={!!errors.yearPublishedTo}
                      style={{ width: "5rem" }}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              Number of likes
              <SearchFiltersToggleButtonGroup
                options={likesMenuItems}
                selectedValue={"lowAmount"}
                onChange={() => {}}
              />
            </div>
            <div>
              Number of reviews
              <SearchFiltersToggleButtonGroup
                options={reviewsMenuItems}
                selectedValue={"lowAmount"}
                onChange={() => {}}
              />
            </div>
            <div style={{ display: "grid" }}>
              Rating - at least
              <Controller
                name="rating"
                control={control}
                render={({ field }) => <Rating {...field} />}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "1rem 1.5rem",
          }}
        >
          <Button onClick={props.onClose} type="reset" color="error">
            Cancel
          </Button>
          <Button type="submit" disabled={!isDirty}>
            Apply Filters
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default SearchFiltersModal;
