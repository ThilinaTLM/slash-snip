import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ExampleCardProps {
  title: string;
  description: string;
  trigger: string;
  content: string;
}

export function ExampleCard({
  title,
  description,
  trigger,
  content,
}: ExampleCardProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="help-example-card">
      <div className="help-example-header">
        <div className="help-example-info">
          <h4 className="help-example-title">{title}</h4>
          <p className="help-example-description">{description}</p>
        </div>
        <code className="help-example-trigger">{trigger}</code>
      </div>
      <div className="help-example-content">
        <pre className="help-example-code">{content}</pre>
        <button
          className="help-example-copy-btn"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
