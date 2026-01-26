/**
 * Fuzzy search implementation with scoring
 */

export interface FuzzyMatch {
  score: number;
  indices: number[];
}

export interface FuzzyResult<T> {
  item: T;
  score: number;
  matches: Map<string, FuzzyMatch>;
}

/**
 * Performs fuzzy matching between a query and target string
 * Returns match info with score and matched character indices
 */
export function fuzzyMatch(query: string, target: string): FuzzyMatch | null {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  if (queryLower.length === 0) {
    return { score: 1, indices: [] };
  }

  if (queryLower.length > targetLower.length) {
    return null;
  }

  const indices: number[] = [];
  let score = 0;
  let queryIndex = 0;
  let prevMatchIndex = -1;
  let consecutiveBonus = 0;

  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      indices.push(i);

      // Base score for match
      score += 10;

      // Bonus for consecutive matches
      if (prevMatchIndex === i - 1) {
        consecutiveBonus += 5;
        score += consecutiveBonus;
      } else {
        consecutiveBonus = 0;
      }

      // Bonus for start of word
      if (i === 0 || target[i - 1] === ' ' || target[i - 1] === '-' || target[i - 1] === '_') {
        score += 15;
      }

      // Bonus for exact case match
      if (target[i] === query[queryIndex]) {
        score += 2;
      }

      prevMatchIndex = i;
      queryIndex++;
    }
  }

  // All query characters must be found
  if (queryIndex !== queryLower.length) {
    return null;
  }

  // Bonus for shorter targets (more relevant)
  score += Math.max(0, 50 - targetLower.length);

  // Bonus for exact prefix match
  if (targetLower.startsWith(queryLower)) {
    score += 50;
  }

  return { score, indices };
}

/**
 * Performs fuzzy search across multiple items
 * getText function should return an array of strings to search in for each item
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getText: (item: T) => string[]
): FuzzyResult<T>[] {
  if (!query.trim()) {
    return items.map((item) => ({
      item,
      score: 0,
      matches: new Map(),
    }));
  }

  const results: FuzzyResult<T>[] = [];

  for (const item of items) {
    const texts = getText(item);
    const matches = new Map<string, FuzzyMatch>();
    let bestScore = 0;

    for (const text of texts) {
      const match = fuzzyMatch(query, text);
      if (match) {
        matches.set(text, match);
        bestScore = Math.max(bestScore, match.score);
      }
    }

    if (matches.size > 0) {
      results.push({ item, score: bestScore, matches });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}
