import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { FileText } from 'lucide-react';
import type { TemplateDTO } from '@application/dto';

interface DndTreeContextProps {
  templates: TemplateDTO[];
  onMoveTemplate?: (templateId: string, targetGroupId: string | null) => void;
  children: React.ReactNode;
}

export function DndTreeContext({
  templates,
  onMoveTemplate,
  children,
}: DndTreeContextProps): React.ReactElement {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const activeTemplate = activeId
    ? templates.find((t) => t.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !onMoveTemplate) return;

    const templateId = active.id as string;
    const overId = over.id as string;

    // Dropping on "ungrouped" section
    if (overId === 'ungrouped') {
      onMoveTemplate(templateId, null);
      return;
    }

    // Dropping on a group (id starts with "group-")
    if (overId.startsWith('group-')) {
      const groupId = overId.replace('group-', '');
      onMoveTemplate(templateId, groupId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeTemplate && (
          <div className="drag-overlay">
            <FileText size={14} />
            <span>{activeTemplate.trigger}</span>
            <span style={{ color: 'var(--text-muted)' }}>{activeTemplate.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
