import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardIcon } from '@ui/index';
import { ExampleCard } from './ExampleCard';

const examples = {
  chatgpt: [
    {
      title: 'Explain Code',
      description: 'Ask AI to explain selected code',
      trigger: '/explain',
      content: `Explain the following code in detail. What does it do, and how does it work?

\`\`\`
<clipboard>
\`\`\``,
    },
    {
      title: 'Code Review',
      description: 'Request a code review',
      trigger: '/review',
      content: `Please review the following code for:
- Bugs and potential issues
- Performance improvements
- Code style and best practices

\`\`\`
<clipboard>
\`\`\``,
    },
    {
      title: 'Improve Code',
      description: 'Ask for code improvements',
      trigger: '/improve',
      content: `Suggest improvements for the following code. Focus on readability, performance, and maintainability:

\`\`\`
<clipboard>
\`\`\``,
    },
  ],
  jira: [
    {
      title: 'Bug Report',
      description: 'Template for bug reports',
      trigger: '/bug',
      content: `**Summary**
<input:Brief description of the bug>

**Steps to Reproduce**
1. <tab:1:First step>
2. <tab:2:Second step>
3. <tab:3:Third step>

**Expected Behavior**
<tab:4:What should happen>

**Actual Behavior**
<tab:5:What actually happens>

**Environment**
- Browser: <input:Browser and version>
- OS: <input:Operating system>`,
    },
    {
      title: 'User Story',
      description: 'Template for user stories',
      trigger: '/story',
      content: `**As a** <input:user type>
**I want to** <input:goal>
**So that** <input:benefit>

**Acceptance Criteria**
- [ ] <tab:1:First criterion>
- [ ] <tab:2:Second criterion>
- [ ] <tab:3:Third criterion>

**Notes**
<cursor>`,
    },
  ],
  email: [
    {
      title: 'Meeting Invitation',
      description: 'Schedule a meeting',
      trigger: '/meeting',
      content: `Hi <input:Recipient name>,

I'd like to schedule a meeting to discuss <input:Topic>.

**Proposed Time:** <input:Date and time>
**Duration:** <select:Duration:30 minutes,1 hour,1.5 hours>
**Location:** <input:Location or video link>

Please let me know if this works for you, or suggest an alternative time.

Best regards,
<tab:1:Your name>`,
    },
    {
      title: 'Follow-up',
      description: 'Follow up on a previous conversation',
      trigger: '/followup',
      content: `Hi <input:Name>,

I wanted to follow up on our conversation about <input:Topic>.

<cursor>

Please let me know if you have any questions or need additional information.

Best regards,
<tab:1:Your name>`,
    },
  ],
  code: [
    {
      title: 'TODO Comment',
      description: 'TODO with date and author',
      trigger: '/todo',
      content: `// TODO (<date:YYYY-MM-DD>): <cursor>`,
    },
    {
      title: 'Console Log',
      description: 'Debug log with timestamp',
      trigger: '/log',
      content: `console.log('[<time:HH:mm:ss>] <input:Label>:', <clipboard>);`,
    },
    {
      title: 'JSDoc Function',
      description: 'JSDoc template for functions',
      trigger: '/jsdoc',
      content: `/**
 * <input:Description>
 * @param {<tab:1:type>} <tab:2:param> - <tab:3:description>
 * @returns {<tab:4:type>} <tab:5:description>
 */`,
    },
  ],
};

export function ExamplesSection(): React.ReactElement {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <CardIcon>
          <Lightbulb size={16} />
        </CardIcon>
        <h2 className="settings-section-title">Example Templates</h2>
      </div>
      <Card>
        <CardContent>
          <div className="help-content-section">
            <p className="help-intro">
              Here are some example templates to get you started. Click the copy button to copy the
              content and create your own version.
            </p>

            <div className="help-examples-category">
              <h4 className="help-subsection-title">ChatGPT & AI Prompts</h4>
              <div className="help-examples-grid">
                {examples.chatgpt.map((ex) => (
                  <ExampleCard key={ex.trigger} {...ex} />
                ))}
              </div>
            </div>

            <div className="help-examples-category">
              <h4 className="help-subsection-title">Jira & Issue Tracking</h4>
              <div className="help-examples-grid">
                {examples.jira.map((ex) => (
                  <ExampleCard key={ex.trigger} {...ex} />
                ))}
              </div>
            </div>

            <div className="help-examples-category">
              <h4 className="help-subsection-title">Email Templates</h4>
              <div className="help-examples-grid">
                {examples.email.map((ex) => (
                  <ExampleCard key={ex.trigger} {...ex} />
                ))}
              </div>
            </div>

            <div className="help-examples-category">
              <h4 className="help-subsection-title">Code Snippets</h4>
              <div className="help-examples-grid">
                {examples.code.map((ex) => (
                  <ExampleCard key={ex.trigger} {...ex} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
