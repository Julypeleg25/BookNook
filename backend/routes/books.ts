import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY as string;

/* -----------------------------
   Types
------------------------------ */

interface BooksQuery {
  title?: string;
  author?: string;
  subject?: string;
  page?: string;
  limit?: string;
}

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

// New normalized types
export interface BookSummary {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
}

export interface BookDetail extends BookSummary {
  subtitle?: string;
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  categories: string[];
  previewLink?: string;
}

/* -----------------------------
   Helpers
------------------------------ */

// For list view
function normalizeBookSummary(volume: GoogleBooksVolume): BookSummary {
  const info = volume.volumeInfo;
  return {
    id: volume.id,
    title: info.title,
    authors: info.authors ?? [],
    thumbnail: info.imageLinks?.thumbnail,
  };
}

// For detail view
function normalizeBookDetail(volume: GoogleBooksVolume): BookDetail {
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
   Routes
------------------------------ */

/**
 * @openapi
 * /api/books:
 *   get:
 *     summary: Search books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema: { type: string }
 *       - in: query
 *         name: author
 *         schema: { type: string }
 *       - in: query
 *         name: subject
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 40
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 totalItems: { type: integer }
 *                 totalPages: { type: integer }
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BookSummary'
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      author,
      subject,
      page = '1',
      limit = '10',
    } = req.query as BooksQuery;

    const queryParts: string[] = [];
    if (title) queryParts.push(`intitle:${title}`);
    if (author) queryParts.push(`inauthor:${author}`);
    if (subject) queryParts.push(`subject:${subject}`);

    const q = queryParts.length ? queryParts.join('+') : ' ';

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const startIndex = (pageNumber - 1) * limitNumber;

    const fields = 'items(id,volumeInfo(title,authors,imageLinks/thumbnail)),totalItems';

    const response = await axios.get<GoogleBooksResponse>(GOOGLE_BOOKS_API, {
      params: {
        q,
        startIndex,
        maxResults: limitNumber,
        fields,
        key: API_KEY,
      },
    });

    const data = response.data;

    res.json({
      page: pageNumber,
      limit: limitNumber,
      totalItems: data.totalItems ?? 0,
      totalPages: data.totalItems ? Math.ceil(data.totalItems / limitNumber) : 0,
      items: data.items?.map(normalizeBookSummary) ?? [],
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

/**
 * @openapi
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Books volume ID
 *     responses:
 *       200:
 *         description: Book found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book:
 *                   $ref: '#/components/schemas/BookDetail'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const response = await axios.get<GoogleBooksVolume>(
      `${GOOGLE_BOOKS_API}/${id}`,
      { params: { key: API_KEY } }
    );

    res.json({
      book: normalizeBookDetail(response.data),
    });
  } catch {
    res.status(500).json({ message: 'Failed to fetch book' });
  }
});

export default router;
