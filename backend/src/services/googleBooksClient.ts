import axios from "axios";
import type { GoogleBooksResponse, GoogleBooksVolume } from "@models/ApiBook";
import { ENV } from "@config/config";
import { NotFoundError } from "@utils/errors";
import { logger } from "@utils/logger";

const GOOGLE_BOOKS_API = ENV.GOOGLE_BOOKS_API;
const API_KEY = ENV.GOOGLE_BOOKS_API_KEY;

const googleBooksAuthParams = (): { key: string } | undefined => {
  return API_KEY ? { key: API_KEY } : undefined;
};

interface SearchGoogleBooksParams {
  q: string;
  startIndex: number;
  maxResults: number;
  fields: string;
}

export const searchGoogleBooks = async (
  params: SearchGoogleBooksParams,
): Promise<GoogleBooksResponse> => {
  const response = await axios.get<GoogleBooksResponse>(GOOGLE_BOOKS_API, {
    params: {
      ...params,
      ...(googleBooksAuthParams() ?? {}),
    },
  });

  return response.data;
};

export const getGoogleBookById = async (
  googleId: string,
): Promise<GoogleBooksVolume> => {
  try {
    const response = await axios.get<GoogleBooksVolume>(
      `${GOOGLE_BOOKS_API}/${googleId}`,
      {
        params: googleBooksAuthParams(),
      },
    );
    return response.data;
  } catch (error) {
    logger.error(`Error fetching book ${googleId} from Google Books API:`, error);
    throw new NotFoundError("Book not found in Google Books");
  }
};
