import React from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

interface SafeMarkdownProps extends Options {
  className?: string;
}

/**
 * A secure wrapper around react-markdown.
 * 
 * This component uses `rehype-sanitize` to strip out dangerous HTML and
 * unsafe URI protocols (like javascript:), preventing Stored XSS attacks
 * from user-generated notes or shared public pages.
 */
export default function SafeMarkdown({
  children,
  className,
  ...props
}: SafeMarkdownProps) {
  // We merge the default plugins with rehypeSanitize.
  // If you use other plugins like remarkGfm, they would go into a remarkPlugins array here.
  const rehypePlugins = props.rehypePlugins 
    ? [...props.rehypePlugins, rehypeSanitize] 
    : [rehypeSanitize];

  return (
    <div className={`prose prose-purple max-w-none ${className || ''}`}>
      <ReactMarkdown
        {...props}
        rehypePlugins={rehypePlugins}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
