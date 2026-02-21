import { BookModel, IBook } from "@models/Book";
import { UserReviewModel } from "@models/UserReview";
import { logger } from "@utils/logger";
import { recomputeBookRating } from "./ratingService";

export const findAndMergeDuplicates = async (): Promise<{ mergedCount: number }> => {
  logger.info("Starting book deduplication and review consolidation...");
  
  // 1. Find all books with ISBNs
  const booksWithIsbn = await BookModel.find({ 
    $or: [{ isbn13: { $exists: true } }, { isbn10: { $exists: true } }] 
  });

  // 2. Group by ISBN13 (preferred) or ISBN10
  const isbnGroups = new Map<string, IBook[]>();
  
  for (const book of booksWithIsbn) {
    const key = book.isbn13 || book.isbn10;
    if (!key) continue;
    
    if (!isbnGroups.has(key)) {
      isbnGroups.set(key, []);
    }
    isbnGroups.get(key)!.push(book);
  }

  let mergedCount = 0;

  // 3. Process groups with duplicates
  for (const [isbn, duplicates] of isbnGroups.entries()) {
    if (duplicates.length <= 1) continue;

    logger.info(`Found ${duplicates.length} duplicates for ISBN ${isbn}. Merging...`);

    // Choose the canonical record (one with most reviews or earliest)
    const sorted = duplicates.sort((a, b) => b.ratingCount - a.ratingCount);
    const canonical = sorted[0];
    const others = sorted.slice(1);

    for (const other of others) {
      // Move all reviews from 'other' to 'canonical'
      const updateResult = await UserReviewModel.updateMany(
        { book: other._id },
        { book: canonical._id }
      );

      logger.info(`Migrated ${updateResult.modifiedCount} reviews from ${other._id} to canonical ${canonical._id}`);

      // Delete the duplicate book record
      await BookModel.findByIdAndDelete(other._id);
      mergedCount++;
    }

    // Recompute canonical rating after merging
    await recomputeBookRating(canonical._id.toString());
  }

  logger.info(`Deduplication complete. ${mergedCount} duplicate books removed.`);
  return { mergedCount };
};
