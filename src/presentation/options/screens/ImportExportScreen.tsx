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
    <div className="import-export-screen">
      <div className="import-export-container">
        <div className="import-export-header">
          <h1 className="import-export-title">Import / Export</h1>
          <p className="import-export-subtitle">
            Back up your templates or restore from a previous backup
          </p>
        </div>

        <div className="import-export-sections">
          {/* Export Section */}
          <section className="import-export-section">
            <div className="import-export-section-header">
              <div className="import-export-section-icon">
                <Download size={20} />
              </div>
              <div className="import-export-section-info">
                <h2>Export Backup</h2>
                <p>Download all your templates and groups as a JSON file</p>
              </div>
            </div>
            <div className="import-export-actions">
              <button
                className="import-export-download-btn"
                onClick={handleExport}
              >
                <Download size={16} />
                Download Backup
              </button>
              <span className="import-export-count">
                {templates.length} templates, {groups.length} groups
              </span>
            </div>
          </section>

          {/* Import Section */}
          <section className="import-export-section">
            <div className="import-export-section-header">
              <div className="import-export-section-icon">
                <Upload size={20} />
              </div>
              <div className="import-export-section-info">
                <h2>Import Backup</h2>
                <p>Restore templates and groups from a backup file</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              className={`import-export-dropzone ${isDragging ? 'import-export-dropzone-active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="import-export-dropzone-icon">
                <Upload size={24} />
              </div>
              <p className="import-export-dropzone-title">
                Drop your backup file here or click to browse
              </p>
              <p className="import-export-dropzone-subtitle">
                Supports .json files exported from SlashSnip
              </p>
            </div>

            {importStatus && (
              <div
                className={`import-export-status ${
                  importStatus.type === 'success'
                    ? 'import-export-status-success'
                    : 'import-export-status-error'
                }`}
              >
                {importStatus.type === 'success' ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
