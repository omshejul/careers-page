"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          // Override heading styles to use default font
          h1: ({ children }) => (
            <h3 className="mb-4 mt-6 text-lg font-semibold first:mt-0 sm:text-xl">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="mb-3 mt-5 text-base font-semibold first:mt-0 sm:text-lg">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="mb-2 mt-4 text-sm font-semibold first:mt-0 sm:text-base">
              {children}
            </h5>
          ),
          h4: ({ children }) => (
            <h6 className="mb-2 mt-3 text-sm font-medium first:mt-0 sm:text-base">
              {children}
            </h6>
          ),
          // Paragraphs with default styling
          p: ({ children }) => (
            <p className="mb-4 text-sm leading-relaxed last:mb-0 sm:text-base">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 ml-4 list-disc space-y-2 last:mb-0 sm:ml-6">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-4 list-decimal space-y-2 last:mb-0 sm:ml-6">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              {children}
            </a>
          ),
          // Code blocks
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className={className}>{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm last:mb-0">
              {children}
            </pre>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-muted-foreground/20 pl-3 text-sm italic text-muted-foreground sm:pl-4 sm:text-base">
              {children}
            </blockquote>
          ),
          // Horizontal rule
          hr: () => <hr className="my-6 border-muted" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
