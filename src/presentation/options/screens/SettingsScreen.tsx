import React, { useRef, useState } from 'react';
import { Settings, Zap, Download, Upload, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardRow,
  CardRowLabel,
  CardRowTitle,
  CardRowDescription,
  CardIcon,
} from '@ui/index';
import { Switch } from '@ui/switch';
import { Select, SelectItem } from '@ui/select';
import { ImportDialog } from '../components/ImportDialog';
import { sendMessage } from '@infrastructure/chrome/messaging';
import { MESSAGE_TYPES } from '@shared/constants';
import { validateBackup, type PreviewResult, type ImportResult, type ConflictResolution, type BackupData, type ConflictInfo } from '@application/use-cases/import-export';
import type { AppSettings } from '@shared/types/settings';
import type { TemplateDTO, GroupDTO } from '@application/dto';

interface SettingsScreenProps {
  settings: AppSettings;
  templates: TemplateDTO[];
  groups: GroupDTO[];
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onRefresh?: () => Promise<void>;
}

interface ExportData {
  version: string;
  exportedAt: string;
  templates: TemplateDTO[];
  groups: GroupDTO[];
}

export function SettingsScreen({
  settings,
  templates,
  groups,
  onUpdateSettings,
  onRefresh,
}: SettingsScreenProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<PreviewResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again
    e.target.value = '';

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate backup structure
      const validation = validateBackup(data);
      if (!validation.valid || !validation.data) {
        setImportPreview({
          valid: false,
          errors: validation.errors.map(e => `${e.field}: ${e.message}`),
          warnings: validation.warnings.map(w => `${w.field}: ${w.message}`),
          templateCount: 0,
          groupCount: 0,
          conflicts: [],
        });
        setImportResult(null);
        setImportError(null);
        setImportDialogOpen(true);
        return;
      }

      const backupData = validation.data;
      const caseSensitive = settings.caseSensitive;

      // Detect trigger conflicts locally
      const conflicts: ConflictInfo[] = [];
      for (const templateDTO of backupData.templates) {
        const existing = templates.find(t => {
          if (caseSensitive) {
            return t.trigger === templateDTO.trigger;
          }
          return t.trigger.toLowerCase() === templateDTO.trigger.toLowerCase();
        });

        if (existing) {
          conflicts.push({
            importedTrigger: templateDTO.trigger,
            importedName: templateDTO.name,
            existingId: existing.id,
            existingName: existing.name,
          });
        }
      }

      setImportPreview({
        valid: true,
        errors: [],
        warnings: validation.warnings.map(w => `${w.field}: ${w.message}`),
        templateCount: backupData.templates.length,
        groupCount: backupData.groups.length,
        conflicts,
        data: backupData,
      });
      setImportResult(null);
      setImportError(null);
      setImportDialogOpen(true);
    } catch (err) {
      setImportPreview(null);
      setImportResult(null);
      setImportError(err instanceof Error ? err.message : 'Failed to parse file');
      setImportDialogOpen(true);
    }
  };

  const handleImport = async (resolution: ConflictResolution) => {
    if (!importPreview?.data) {
      throw new Error('No backup data available');
    }

    const response = await sendMessage<
      { backupData: BackupData; options: { conflictResolution: ConflictResolution } },
      ImportResult
    >(MESSAGE_TYPES.IMPORT_BACKUP, {
      backupData: importPreview.data,
      options: { conflictResolution: resolution },
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Import failed');
    }

    setImportResult(response.data);

    // Refresh templates after import
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleDialogClose = () => {
    setImportDialogOpen(false);
    setImportPreview(null);
    setImportResult(null);
    setImportError(null);
  };

  return (
    <div className="settings-screen">
      <div className="settings-container">
        <div className="settings-header">
          <div className="settings-icon-wrapper">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">
              Configure how SlashSnip works for you
            </p>
          </div>
        </div>

        <div className="settings-sections">
          {/* Trigger Settings */}
          <section className="settings-section">
            <div className="settings-section-header">
              <CardIcon>
                <Zap size={16} />
              </CardIcon>
              <h2 className="settings-section-title">Trigger Behavior</h2>
            </div>
            <Card>
              <CardContent>
                <CardRow>
                  <CardRowLabel>
                    <CardRowTitle>Expansion Trigger</CardRowTitle>
                    <CardRowDescription>
                      How to trigger template expansion after typing a shortcut
                    </CardRowDescription>
                  </CardRowLabel>
                  <Select
                    value={settings.triggerKey}
                    onValueChange={(value) => onUpdateSettings({ triggerKey: value as AppSettings['triggerKey'] })}
                    className="settings-select"
                  >
                    <SelectItem value="space">Space</SelectItem>
                    <SelectItem value="none">Immediate</SelectItem>
                  </Select>
                </CardRow>
                {settings.triggerKey === 'none' && (
                  <CardRow>
                    <div className="settings-warning">
                      <AlertCircle size={16} />
                      <span>
                        In immediate mode, triggers expand as soon as typed. Avoid creating
                        triggers that are prefixes of each other (e.g., <code>/t</code> and <code>/test</code>)
                        as the shorter one will always match first.
                      </span>
                    </div>
                  </CardRow>
                )}
                <CardRow>
                  <CardRowLabel>
                    <CardRowTitle>Case Sensitivity</CardRowTitle>
                    <CardRowDescription>
                      Whether trigger shortcuts are case-sensitive
                    </CardRowDescription>
                  </CardRowLabel>
                  <Switch
                    checked={settings.caseSensitive}
                    onCheckedChange={(checked) => onUpdateSettings({ caseSensitive: checked })}
                    aria-label="Case sensitivity"
                  />
                </CardRow>
              </CardContent>
            </Card>
          </section>

          {/* Import/Export */}
          <section className="settings-section">
            <div className="settings-section-header">
              <CardIcon>
                <Download size={16} />
              </CardIcon>
              <h2 className="settings-section-title">Import / Export</h2>
            </div>

            <Card>
              <CardContent>
                <CardRow>
                  <CardRowLabel>
                    <CardRowTitle>Export Backup</CardRowTitle>
                    <CardRowDescription>
                      {templates.length} templates, {groups.length} groups
                    </CardRowDescription>
                  </CardRowLabel>
                  <button
                    className="import-export-download-btn"
                    onClick={handleExport}
                  >
                    <Download size={16} />
                    Export
                  </button>
                </CardRow>
                <CardRow>
                  <CardRowLabel>
                    <CardRowTitle>Import Backup</CardRowTitle>
                    <CardRowDescription>
                      Restore from a .json backup file
                    </CardRowDescription>
                  </CardRowLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    className="import-export-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    Import
                  </button>
                </CardRow>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <ImportDialog
        open={importDialogOpen}
        onClose={handleDialogClose}
        preview={importPreview}
        onImport={handleImport}
        importResult={importResult}
        error={importError}
      />
    </div>
  );
}
