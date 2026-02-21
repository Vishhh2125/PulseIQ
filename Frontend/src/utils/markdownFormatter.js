/**
 * Simple markdown to JSX formatter for medical responses
 * Handles: bold, italic, lists, headings, line breaks
 */

export const formatMarkdownText = (text) => {
  if (!text) return "";

  // Split by lines first to handle list items and headings
  const lines = text.split("\n");
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines but preserve structure
    if (!line.trim()) {
      elements.push(<br key={`br-${i}`} />);
      continue;
    }

    // Handle headings (### Heading, ## Heading, # Heading)
    if (line.startsWith("###")) {
      const heading = line.replace(/^### /, "");
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-bold mt-3 mb-2">
          {formatInlineMarkdown(heading)}
        </h3>
      );
      continue;
    }

    if (line.startsWith("##")) {
      const heading = line.replace(/^## /, "");
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-bold mt-4 mb-2">
          {formatInlineMarkdown(heading)}
        </h2>
      );
      continue;
    }

    if (line.startsWith("#")) {
      const heading = line.replace(/^# /, "");
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold mt-4 mb-2">
          {formatInlineMarkdown(heading)}
        </h1>
      );
      continue;
    }

    // Handle bullet points (* or -)
    if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
      const content = line.replace(/^[\s*-]+/, "").trim();
      elements.push(
        <div key={`li-${i}`} className="ml-4 mb-1">
          <span className="text-slate-700">• </span>
          {formatInlineMarkdown(content)}
        </div>
      );
      continue;
    }

    // Handle numbered lists
    if (/^\d+\./.test(line.trim())) {
      const content = line.replace(/^\s*\d+\.\s*/, "").trim();
      const number = line.match(/^\s*(\d+)\./)?.[1];
      elements.push(
        <div key={`ol-${i}`} className="ml-4 mb-1">
          <span className="text-slate-700">{number}. </span>
          {formatInlineMarkdown(content)}
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="mb-2 leading-relaxed">
        {formatInlineMarkdown(line)}
      </p>
    );
  }

  return elements;
};

/**
 * Format inline markdown: bold, italic, code
 */
const formatInlineMarkdown = (text) => {
  if (!text) return "";

  const parts = [];
  let lastIndex = 0;

  // Pattern to match **bold**, *italic*, and `code`
  const pattern = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matched = match[0];

    // Handle bold (**text**)
    if (matched.startsWith("**") && matched.endsWith("**")) {
      const boldText = matched.slice(2, -2);
      parts.push(
        <strong key={`bold-${match.index}`} className="font-bold text-slate-900">
          {boldText}
        </strong>
      );
    }
    // Handle italic (*text*)
    else if (matched.startsWith("*") && matched.endsWith("*")) {
      const italicText = matched.slice(1, -1);
      parts.push(
        <em key={`italic-${match.index}`} className="italic text-slate-700">
          {italicText}
        </em>
      );
    }
    // Handle code (`text`)
    else if (matched.startsWith("`") && matched.endsWith("`")) {
      const codeText = matched.slice(1, -1);
      parts.push(
        <code
          key={`code-${match.index}`}
          className="bg-slate-100 px-2 py-1 rounded text-sm font-mono"
        >
          {codeText}
        </code>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};
