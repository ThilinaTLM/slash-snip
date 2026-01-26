import type { ITemplateRepository } from '@domain/repositories';
import type { TemplateDTO } from '@application/dto/template.dto';
import { toTemplateDTO } from '@application/dto/template.dto';
import type { Template } from '@domain/entities';

export interface SearchResult {
  template: TemplateDTO;
  score: number;
}

export class SearchTemplatesUseCase {
  constructor(private templateRepository: ITemplateRepository) {}

  /**
   * Search templates by query string using fuzzy matching
   * Searches trigger, name, content, description, and tags
   * Results are sorted by relevance score (higher = better match)
   */
  async execute(query: string, limit = 20): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      // Return all templates sorted by usage count
      const templates = await this.templateRepository.findAll();
      return templates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit)
        .map((t) => ({ template: toTemplateDTO(t), score: 1 }));
    }

    const normalizedQuery = query.toLowerCase().trim();
    const templates = await this.templateRepository.findAll();

    // Score each template
    const scored: { template: Template; score: number }[] = [];

    for (const template of templates) {
      const score = this.calculateScore(template, normalizedQuery);
      if (score > 0) {
        scored.push({ template, score });
      }
    }

    // Sort by score descending, then usage count
    scored.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return b.template.usageCount - a.template.usageCount;
    });

    return scored.slice(0, limit).map((s) => ({
      template: toTemplateDTO(s.template),
      score: s.score,
    }));
  }

  /**
   * Calculate relevance score for a template
   */
  private calculateScore(template: Template, query: string): number {
    let score = 0;

    const trigger = template.trigger.toLowerCase();
    const name = template.name.toLowerCase();
    const content = template.content.toLowerCase();
    const description = (template.description ?? '').toLowerCase();
    const tags = template.tags.map((t) => t.toLowerCase());

    // Exact trigger match - highest priority
    if (trigger === query) {
      score += 100;
    } else if (trigger.startsWith(query)) {
      score += 80;
    } else if (trigger.includes(query)) {
      score += 60;
    } else if (this.fuzzyMatch(trigger, query)) {
      score += 40;
    }

    // Name match
    if (name === query) {
      score += 50;
    } else if (name.startsWith(query)) {
      score += 40;
    } else if (name.includes(query)) {
      score += 30;
    } else if (this.fuzzyMatch(name, query)) {
      score += 20;
    }

    // Tags match
    for (const tag of tags) {
      if (tag === query) {
        score += 35;
      } else if (tag.includes(query)) {
        score += 25;
      }
    }

    // Description match
    if (description.includes(query)) {
      score += 15;
    } else if (this.fuzzyMatch(description, query)) {
      score += 10;
    }

    // Content match - lower priority
    if (content.includes(query)) {
      score += 10;
    }

    return score;
  }

  /**
   * Simple fuzzy match - checks if all characters of query appear in text in order
   */
  private fuzzyMatch(text: string, query: string): boolean {
    let textIndex = 0;
    let queryIndex = 0;

    while (textIndex < text.length && queryIndex < query.length) {
      if (text[textIndex] === query[queryIndex]) {
        queryIndex++;
      }
      textIndex++;
    }

    return queryIndex === query.length;
  }
}
