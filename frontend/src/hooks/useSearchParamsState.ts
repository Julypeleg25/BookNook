import { useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { ISearchFiltersForm } from "@/components/searchFilters/models/SearchFiltersOptions";

export const useSearchParamsState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQuery = searchParams.get("q") || "";

  const [localSearchQuery, setLocalSearchQuery] = useState(urlQuery);

  useEffect(() => {
    setLocalSearchQuery(urlQuery);
  }, [urlQuery]);

  const filters = useMemo<ISearchFiltersForm>(() => {
    return {
      language: searchParams.get("language") || "",
      genre: searchParams.get("genre") || "",
      author: searchParams.get("author") || "",
      yearPublishedFrom: searchParams.get("yearPublishedFrom") || "",
      yearPublishedTo: searchParams.get("yearPublishedTo") || "",
      rating: Number(searchParams.get("rating")) || 0,
      likesAmount: Number(searchParams.get("likesAmount")) || 0,
      reviewsAmount: Number(searchParams.get("reviewsAmount")) || 0,
      username: searchParams.get("username") || "",
    };
  }, [searchParams]);

  const updateSearchParams = (newParams: Record<string, string | number | undefined | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === 0) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });
    setSearchParams(nextParams);
  };

  const handleSearch = (newSearchTerm?: string) => {
    updateSearchParams({ q: newSearchTerm ?? localSearchQuery });
  };

  const handleApplyFilters = (newFilters: ISearchFiltersForm) => {
    updateSearchParams({
      ...newFilters,
      q: urlQuery,
    });
  };

  const handleClear = () => {
    setLocalSearchQuery("");
    setSearchParams({});
  };

  const setGenre = (genre: string) => {
    const newGenre = filters.genre === genre ? "" : genre;
    handleApplyFilters({ ...filters, genre: newGenre });
  };

  return {
    filters,
    urlQuery,
    localSearchQuery,
    setLocalSearchQuery,
    updateSearchParams,
    handleSearch,
    handleApplyFilters,
    handleClear,
    setGenre,
  };
};
