import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY as string;

/* -----------------------------
   Types
------------------------------ */

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
    previewLink?: string;
  };
}

interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

interface NormalizedBook {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  categories: string[];
  thumbnail?: string;
  previewLink?: string;
}

/* -----------------------------
   Helpers
------------------------------ */

function normalizeBook(volume: GoogleBooksVolume): NormalizedBook {
  const info = volume.volumeInfo;

  return {
    id: volume.id,
    title: info.title,
    subtitle: info.subtitle,
    authors: info.authors ?? [],
    description: info.description,
    publishedDate: info.publishedDate,
    pageCount: info.pageCount,
    categories: info.categories ?? [],
    thumbnail: info.imageLinks?.thumbnail,
    previewLink: info.previewLink,
  };
}

/* -----------------------------
   Route
------------------------------ */
/**
 * @openapi
 * /api/books:
 *   get:
 *     summary: Search books
 *     description: >
 *       Search for books by title, author, and/or subject.
 *       All query parameters are optional.
 *     tags:
 *       - Books
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Search by book title
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Search by author
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Search by subject/category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 40
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Paginated list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 */

router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      author,
      subject,
      page = '1',
      limit = '10',
    } = req.query;

    const queryParts: string[] = [];

    if (title) queryParts.push(`intitle:${title}`);
    if (author) queryParts.push(`inauthor:${author}`);
    if (subject) queryParts.push(`subject:${subject}`);
    const fieldsToFetch = [
      'title',
      'authors',
      'imageLinks/thumbnail',
    ];
    const fields = 'items(id,volumeInfo(' + fieldsToFetch.join(',') + ')),totalItems';
    const q = queryParts.length ? queryParts.join('+') : '';

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const startIndex = (pageNumber - 1) * limitNumber;

    const response = await axios.get<GoogleBooksResponse>(
      GOOGLE_BOOKS_API,
      {
        params: {
          q,
          startIndex,
          maxResults: limitNumber,
          fields,
          key: API_KEY,
        },
      }
    );

    const data = response.data;

    const books: NormalizedBook[] =
      data.items?.map(normalizeBook) ?? [];

    res.json({
      page: pageNumber,
      limit: limitNumber,
      totalItems: data.totalItems || 0,
      totalPages: data.totalItems
        ? Math.ceil(data.totalItems / limitNumber)
        : 0,
      items: books,
    });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to fetch books',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const {
      id
    } = req.params;

    const response = await axios.get<GoogleBooksVolume>(
      GOOGLE_BOOKS_API + `/${id}`
    );

    const data = response.data;

    const book: NormalizedBook =
      normalizeBook(data);

    res.json({
     book
    });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to fetch book',
    });
  }
});
export default router;
/**
 * @openapi
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - authors
 *         - categories
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *         authors:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         publishedDate:
 *           type: string
 *         pageCount:
 *           type: integer
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         thumbnail:
 *           type: string
 *         previewLink:
 *           type: string
 */
