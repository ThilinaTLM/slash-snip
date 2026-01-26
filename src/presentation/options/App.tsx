import React, { useState } from 'react';
import { TemplateList } from './components/TemplateList';
import { TemplateEditor } from './components/TemplateEditor';
import { SearchBar } from './components/SearchBar';
import { PreviewPane } from './components/PreviewPane';
import { CategoryTree } from './components/CategoryTree';
import { CategoryDialog } from './components/CategoryDialog';
import { useTemplates } from './hooks/useTemplates';
import { useCategories } from './hooks/useCategories';
import { useTemplateSearch } from './hooks/useTemplateSearch';
import type { CreateTemplateDTO, UpdateTemplateDTO, CreateCategoryDTO, UpdateCategoryDTO, CategoryDTO, TemplateDTO } from '@application/dto';

export function App(): React.ReactElement {
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: refreshTemplates,
  } = useTemplates();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Category dialog state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

  // Filter templates by category
  const categoryFilteredTemplates = selectedCategoryId
    ? templates.filter((t) => t.categoryId === selectedCategoryId)
    : templates;

  const filteredTemplates = useTemplateSearch(categoryFilteredTemplates, searchQuery);
  const selectedTemplate = selectedId
    ? templates.find((t) => t.id === selectedId) ?? null
    : null;

  const loading = templatesLoading || categoriesLoading;
  const error = templatesError || categoriesError;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsCreating(false);
  };

  const handleNewTemplate = () => {
    setSelectedId(null);
    setIsCreating(true);
  };

  const handleSave = async (data: CreateTemplateDTO | UpdateTemplateDTO) => {
    if ('id' in data) {
      const success = await updateTemplate(data);
      if (success) {
        // Stay on the template
      }
    } else {
      // Add category if filtering by category
      if (selectedCategoryId && !data.categoryId) {
        data = { ...data, categoryId: selectedCategoryId };
      }
      const newTemplate = await createTemplate(data);
      if (newTemplate) {
        setSelectedId(newTemplate.id);
        setIsCreating(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteTemplate(id);
    if (success && selectedId === id) {
      setSelectedId(null);
    }
  };

  const handleDuplicate = async (template: TemplateDTO) => {
    // Generate unique trigger
    let newTrigger = `${template.trigger}-copy`;
    let counter = 1;
    while (templates.some((t) => t.trigger === newTrigger)) {
      counter++;
      newTrigger = `${template.trigger}-copy${counter}`;
    }

    const duplicateData: CreateTemplateDTO = {
      trigger: newTrigger,
      name: `${template.name} (Copy)`,
      content: template.content,
      description: template.description,
      categoryId: template.categoryId,
      tags: [...template.tags],
    };

    const newTemplate = await createTemplate(duplicateData);
    if (newTemplate) {
      setSelectedId(newTemplate.id);
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    if (!selectedId && templates.length > 0) {
      setSelectedId(templates[0].id);
    }
  };

  // Category handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: CategoryDTO) => {
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category? Templates will not be deleted.'
    );
    if (confirmed) {
      await deleteCategory(id);
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
      }
    }
  };

  const handleSaveCategory = async (data: CreateCategoryDTO | UpdateCategoryDTO) => {
    if ('id' in data) {
      await updateCategory(data);
    } else {
      await createCategory(data);
    }
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="options-container">
      <header className="options-header">
        <div className="header-left">
          <h1 className="logo">
            <span className="logo-slash">/</span>SlashSnip
          </h1>
          <span className="header-subtitle">Template Manager</span>
        </div>
        <div className="header-right">
          <button
            className="btn btn-primary"
            onClick={handleNewTemplate}
          >
            + New Template
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={refreshTemplates} className="btn btn-small">
            Retry
          </button>
        </div>
      )}

      <main className="options-main">
        <aside className="category-sidebar">
          <CategoryTree
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onCreateCategory={handleCreateCategory}
          />
        </aside>

        <aside className="template-sidebar">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <TemplateList
              templates={filteredTemplates}
              categories={categories}
              selectedId={selectedId}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          )}
        </aside>

        <section className="template-content">
          {isCreating || selectedTemplate ? (
            <>
              <div className="editor-container">
                <TemplateEditor
                  template={isCreating ? null : selectedTemplate}
                  categories={categories}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onDelete={selectedTemplate ? () => handleDelete(selectedTemplate.id) : undefined}
                  onDuplicate={selectedTemplate ? () => handleDuplicate(selectedTemplate) : undefined}
                  onCreateCategory={handleCreateCategory}
                />
              </div>
              <div className="preview-container">
                <PreviewPane
                  content={
                    isCreating
                      ? ''
                      : selectedTemplate?.content ?? ''
                  }
                />
              </div>
            </>
          ) : (
            <div className="empty-state-container">
              <div className="empty-state-icon">📝</div>
              <h2 className="empty-state-title">No Template Selected</h2>
              <p className="empty-state-text">Select a template to edit or create a new one</p>
              <button className="btn btn-primary" onClick={handleNewTemplate}>
                + New Template
              </button>
            </div>
          )}
        </section>
      </main>

      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        category={editingCategory}
        categories={categories}
        onSave={handleSaveCategory}
        onClose={() => {
          setIsCategoryDialogOpen(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
}
