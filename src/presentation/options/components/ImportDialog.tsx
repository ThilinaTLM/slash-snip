import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  Button,
} from '@ui/index';
import type {
  PreviewResult,
  ImportResult,
  ConflictResolution,
} from '@application/use-cases/import-export';

type DialogState = 'preview' | 'importing' | 'complete' | 'error';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  preview: PreviewResult | null;
  onImport: (resolution: ConflictResolution) => Promise<void>;
  importResult: ImportResult | null;
  error: string | null;
}

export function ImportDialog({
  open,
  onClose,
  preview,
  onImport,
  importResult,
  error,
}: ImportDialogProps): React.ReactElement {
  const [state, setState] = useState<DialogState>('preview');
  const [resolution, setResolution] = useState<ConflictResolution>('skip');

  const hasConflicts = (preview?.conflicts.length ?? 0) > 0;

  const handleImport = async () => {
    setState('importing');
    try {
      await onImport(resolution);
      setState('complete');
    } catch {
      setState('error');
    }
  };

  const handleClose = () => {
    setState('preview');
    setResolution('skip');
    onClose();
  };

  // Show error state if validation failed
  if (!preview?.valid || error) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader onClose={handleClose}>
            <DialogTitle>Import Failed</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="import-dialog-error">
              <AlertCircle size={40} className="import-dialog-error-icon" />
              <p className="import-dialog-error-title">Invalid backup file</p>
              <div className="import-dialog-error-list">
                {error && <p>{error}</p>}
                {preview?.errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Importing state
  if (state === 'importing') {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importing...</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="import-dialog-loading">
              <Loader2 size={40} className="import-dialog-spinner" />
              <p>Importing templates and groups...</p>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }

  // Complete state
  if (state === 'complete' && importResult) {
    const totalImported =
      importResult.templatesImported + importResult.templatesReplaced;
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader onClose={handleClose}>
            <DialogTitle>Import Complete</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="import-dialog-success">
              <CheckCircle size={40} className="import-dialog-success-icon" />
              <p className="import-dialog-success-title">Import successful!</p>
              <div className="import-dialog-stats">
                {totalImported > 0 && (
                  <p>
                    {totalImported} template{totalImported !== 1 ? 's' : ''}{' '}
                    imported
                  </p>
                )}
                {importResult.templatesReplaced > 0 && (
                  <p className="import-dialog-stat-detail">
                    ({importResult.templatesReplaced} replaced)
                  </p>
                )}
                {importResult.templatesSkipped > 0 && (
                  <p>
                    {importResult.templatesSkipped} template
                    {importResult.templatesSkipped !== 1 ? 's' : ''} skipped
                  </p>
                )}
                {importResult.groupsImported > 0 && (
                  <p>
                    {importResult.groupsImported} group
                    {importResult.groupsImported !== 1 ? 's' : ''} imported
                  </p>
                )}
                {importResult.errors.length > 0 && (
                  <div className="import-dialog-result-errors">
                    <p className="import-dialog-result-errors-title">
                      {importResult.errors.length} error
                      {importResult.errors.length !== 1 ? 's' : ''}:
                    </p>
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="import-dialog-result-error">
                        {err}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Preview state (default)
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader onClose={handleClose}>
          <DialogTitle>Import Backup</DialogTitle>
          <DialogDescription>
            Review the backup contents before importing
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="import-dialog-preview">
            <div className="import-dialog-counts">
              <div className="import-dialog-count">
                <span className="import-dialog-count-value">
                  {preview.templateCount}
                </span>
                <span className="import-dialog-count-label">
                  Template{preview.templateCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="import-dialog-count">
                <span className="import-dialog-count-value">
                  {preview.groupCount}
                </span>
                <span className="import-dialog-count-label">
                  Group{preview.groupCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {preview.warnings.length > 0 && (
              <div className="import-dialog-warnings">
                {preview.warnings.map((warning, i) => (
                  <p key={i} className="import-dialog-warning">
                    {warning}
                  </p>
                ))}
              </div>
            )}

            {hasConflicts && (
              <div className="import-dialog-conflicts">
                <div className="import-dialog-conflicts-header">
                  <AlertTriangle size={16} />
                  <span>
                    {preview.conflicts.length} trigger conflict
                    {preview.conflicts.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                <div className="import-dialog-conflicts-list">
                  {preview.conflicts.slice(0, 5).map((conflict, i) => (
                    <div key={i} className="import-dialog-conflict-item">
                      <code>{conflict.importedTrigger}</code>
                      <span>
                        &quot;{conflict.importedName}&quot; conflicts with
                        &quot;{conflict.existingName}&quot;
                      </span>
                    </div>
                  ))}
                  {preview.conflicts.length > 5 && (
                    <p className="import-dialog-conflicts-more">
                      and {preview.conflicts.length - 5} more...
                    </p>
                  )}
                </div>

                <div className="import-dialog-resolution">
                  <p className="import-dialog-resolution-title">
                    How to handle conflicts:
                  </p>
                  <label className="import-dialog-resolution-option">
                    <input
                      type="radio"
                      name="resolution"
                      value="skip"
                      checked={resolution === 'skip'}
                      onChange={() => setResolution('skip')}
                    />
                    <div>
                      <span className="import-dialog-resolution-label">
                        Skip conflicts
                      </span>
                      <span className="import-dialog-resolution-desc">
                        Keep existing templates, only import non-conflicting
                      </span>
                    </div>
                  </label>
                  <label className="import-dialog-resolution-option">
                    <input
                      type="radio"
                      name="resolution"
                      value="replace"
                      checked={resolution === 'replace'}
                      onChange={() => setResolution('replace')}
                    />
                    <div>
                      <span className="import-dialog-resolution-label">
                        Replace existing
                      </span>
                      <span className="import-dialog-resolution-desc">
                        Overwrite existing templates with imported ones
                      </span>
                    </div>
                  </label>
                  <label className="import-dialog-resolution-option">
                    <input
                      type="radio"
                      name="resolution"
                      value="keep_both"
                      checked={resolution === 'keep_both'}
                      onChange={() => setResolution('keep_both')}
                    />
                    <div>
                      <span className="import-dialog-resolution-label">
                        Keep both
                      </span>
                      <span className="import-dialog-resolution-desc">
                        Import with modified triggers (e.g., /trigger_2)
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {!hasConflicts && (
              <div className="import-dialog-no-conflicts">
                <CheckCircle size={16} />
                <span>No conflicts detected</span>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport}>
            Import {preview.templateCount} Template
            {preview.templateCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
