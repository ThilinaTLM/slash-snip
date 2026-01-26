import React, { useState } from 'react';
import { TemplateList } from './components/TemplateList';
import { TemplateForm } from './components/TemplateForm';
import { useTemplates } from './hooks/useTemplates';

export function App(): React.ReactElement {
  const { templates, loading, error, createTemplate, deleteTemplate, refresh } = useTemplates();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (data: { trigger: string; name: string; content: string }) => {
    const success = await createTemplate(data);
    if (success) {
      setShowForm(false);
    }
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>SlashSnip</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={refresh} className="btn btn-small">Retry</button>
        </div>
      )}

      {showForm && (
        <TemplateForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="loading">Loading templates...</div>
      ) : (
        <TemplateList
          templates={templates}
          onDelete={deleteTemplate}
        />
      )}
    </div>
  );
}
