import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import axios from "axios";
import { NotFoundError } from "@utils/errors";
import { getGoogleBookById, searchGoogleBooks } from "../../services/googleBooksClient";

jest.mock("@utils/logger");

describe("googleBooksClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("searches Google Books with API key and returns response data", async () => {
    const apiResponse = {
      totalItems: 1,
      items: [{ id: "google-1", volumeInfo: { title: "Book" } }],
    };
    const axiosGetSpy = jest.spyOn(axios, "get").mockResolvedValue({ data: apiResponse });

    const result = await searchGoogleBooks({
      q: "intitle:test",
      startIndex: 0,
      maxResults: 20,
      fields: "items(id)",
    });

    expect(result).toBe(apiResponse);
    expect(axiosGetSpy).toHaveBeenCalledWith(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: expect.objectContaining({
          q: "intitle:test",
          startIndex: 0,
          maxResults: 20,
          fields: "items(id)",
        }),
      },
    );
  });

  it("fetches a single Google book volume by id", async () => {
    const apiResponse = { id: "google-1", volumeInfo: { title: "Book" } };
    const axiosGetSpy = jest.spyOn(axios, "get").mockResolvedValue({ data: apiResponse });

    await expect(getGoogleBookById("google-1")).resolves.toBe(apiResponse);
    expect(axiosGetSpy).toHaveBeenCalledWith(
      "https://www.googleapis.com/books/v1/volumes/google-1",
      { params: expect.any(Object) },
    );
  });

  it("wraps Google lookup failures in a domain not-found error", async () => {
    jest.spyOn(axios, "get").mockRejectedValue(new Error("Network failed"));

    await expect(getGoogleBookById("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});
