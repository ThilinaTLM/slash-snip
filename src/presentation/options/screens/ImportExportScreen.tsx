import React, { useState, useRef } from 'react';
import { Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import type { TemplateDTO, GroupDTO } from '@application/dto';

interface ImportExportScreenProps {
  templates: TemplateDTO[];
  groups: GroupDTO[];
}

interface ExportData {
  version: string;
  exportedAt: string;
  templates: TemplateDTO[];
  groups: GroupDTO[];
}

export function ImportExportScreen({
  templates,
  groups,
}: ImportExportScreenProps): React.ReactElement {
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData: ExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      templates,
      groups,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slashsnip-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      // Validate structure
      if (!data.version || !Array.isArray(data.templates)) {
        throw new Error('Invalid backup file format');
      }

      // For now, just show success - actual import would need use case integration
      setImportStatus({
        type: 'success',
        message: `Found ${data.templates.length} templates and ${data.groups?.length ?? 0} groups. Import functionality coming soon.`,
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to parse backup file',
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImport(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      processImport(file);
    } else {
      setImportStatus({
        type: 'error',
        message: 'Please drop a valid JSON file',
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div className="content-header">
        <div className="content-header-left">
          <h1 className="content-header-title">Import / Export</h1>
        </div>
      </div>

      <div className="content-body">
        <div className="screen-container">
          {/* Export Section */}
          <div className="import-export-section">
            <div className="import-export-card">
              <div className="import-export-header">
                <div className="import-export-icon">
                  <Download size={24} />
                </div>
                <div>
                  <h2 className="import-export-title">Export Backup</h2>
                  <p className="import-export-description">
                    Download all your templates and groups as a JSON file
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <button className="btn btn-primary" onClick={handleExport}>
                  <Download size={16} />
                  Download Backup
                </button>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {templates.length} templates, {groups.length} groups
                </span>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="import-export-section">
            <div className="import-export-card">
              <div className="import-export-header">
                <div className="import-export-icon">
                  <Upload size={24} />
                </div>
                <div>
                  <h2 className="import-export-title">Import Backup</h2>
                  <p className="import-export-description">
                    Restore templates and groups from a backup file
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="drop-zone-icon">
                  <Upload size={32} />
                </div>
                <p className="drop-zone-text">
                  Drop your backup file here or click to browse
                </p>
                <p className="drop-zone-hint">Supports .json files exported from SlashSnip</p>
              </div>

              {importStatus && (
                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    background:
                      importStatus.type === 'success'
                        ? 'var(--color-success-bg)'
                        : 'var(--color-danger-bg)',
                    border: `1px solid ${importStatus.type === 'success' ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
                    color:
                      importStatus.type === 'success'
                        ? 'var(--color-success)'
                        : 'var(--color-danger)',
                  }}
                >
                  {importStatus.type === 'success' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
