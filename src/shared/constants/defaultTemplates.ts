import type { TemplateProps } from '@domain/entities';
import { DEFAULT_GROUP_ID } from '@domain/entities';
import { generateUUID } from '@shared/utils';

/**
 * Default example templates seeded on first install.
 * These demonstrate key placeholder features while being practical.
 */
export function createDefaultTemplates(): TemplateProps[] {
  const now = Date.now();

  return [
    {
      id: generateUUID(),
      trigger: '/sig',
      name: 'Email Signature',
      content: `Best regards,
<input:Your Name>
<date:MMMM D, YYYY>`,
      groupId: DEFAULT_GROUP_ID,
      tags: ['email'],
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    },
    {
      id: generateUUID(),
      trigger: '/meet',
      name: 'Meeting Notes',
      content: `## Meeting Notes - <date:YYYY-MM-DD>

**Attendees:** <input:Attendees>
**Topic:** <tab:1:Meeting topic>

### Discussion
<tab:2>

### Action Items
- <tab:3>`,
      groupId: DEFAULT_GROUP_ID,
      tags: ['meeting', 'notes'],
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    },
    {
      id: generateUUID(),
      trigger: '/reply',
      name: 'Quick Reply',
      content: `Thanks for your message about:

> <clipboard>

<cursor>`,
      groupId: DEFAULT_GROUP_ID,
      tags: ['email', 'reply'],
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    },
  ];
}
