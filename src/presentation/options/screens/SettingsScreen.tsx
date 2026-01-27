import React, { useRef } from 'react';
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
import type { AppSettings } from '@shared/types/settings';
import type { TemplateDTO, GroupDTO } from '@application/dto';

interface SettingsScreenProps {
  settings: AppSettings;
  templates: TemplateDTO[];
  groups: GroupDTO[];
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
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
}: SettingsScreenProps): React.ReactElement {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement actual import logic
      console.log('[SlashSnip] Import file selected:', file.name);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
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
    </div>
  );
}
