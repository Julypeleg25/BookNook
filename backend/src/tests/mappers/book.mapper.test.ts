import { describe, expect, it } from "@jest/globals";
import type { GoogleBooksVolume } from "@models/ApiBook";
import type { IBook } from "@models/Book";
import {
  normalizeBookDetail,
  normalizeBookSummary,
  normalizeLocalBookSummary,
} from "../../mappers/book.mapper";

const googleVolume: GoogleBooksVolume = {
  id: "google-1",
  volumeInfo: {
    title: "The Test Book",
    subtitle: "A Practical Guide",
    authors: ["Author One"],
    description: "Description",
    publishedDate: "2024",
    pageCount: 321,
    categories: ["Fiction"],
    imageLinks: { thumbnail: "https://example.com/cover.jpg" },
    previewLink: "https://example.com/preview",
    averageRating: 4.5,
    ratingsCount: 12,
  },
};

describe("book mapper", () => {
  it("normalizes Google Books summary data into the app shape", () => {
    expect(normalizeBookSummary(googleVolume)).toEqual({
      id: "google-1",
      title: "The Test Book",
      authors: ["Author One"],
      thumbnail: "https://example.com/cover.jpg",
      publishedDate: "2024",
      avgRating: 4.5,
      ratingCount: 12,
      genres: ["Fiction"],
    });
  });

  it("normalizes Google Books detail data with safe collection fallbacks", () => {
    const detail = normalizeBookDetail({
      id: "google-2",
      volumeInfo: {
        title: "Partial Book",
      },
    });

    expect(detail).toMatchObject({
      id: "google-2",
      title: "Partial Book",
      authors: [],
      categories: [],
      genres: [],
    });
  });

  it("normalizes local books without leaking database identifiers", () => {
    const localBook = {
      externalId: "google-3",
      title: "Local Book",
      authors: ["Local Author"],
      thumbnail: "cover",
      publishedDate: "2020",
      avgRating: 4,
      ratingCount: 7,
      categories: ["History"],
    } as IBook;

    expect(normalizeLocalBookSummary(localBook)).toEqual({
      id: "google-3",
      title: "Local Book",
      authors: ["Local Author"],
      thumbnail: "cover",
      publishedDate: "2020",
      avgRating: 4,
      ratingCount: 7,
      genres: ["History"],
    });
  });
});
