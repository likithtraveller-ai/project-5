import React, { useMemo } from 'react';
import { marked } from 'marked';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const html = useMemo(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    return marked.parse(content || '') as string;
  }, [content]);

  // Handler for copying code blocks
  const handleCopy = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      className="prose prose-invert max-w-none text-neutral-200 text-[14.5px] leading-relaxed break-words font-normal
        [&>p]:my-2.5
        [&>ul]:my-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:my-1
        [&>ol]:my-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol>li]:my-1
        [&>h1]:text-lg [&>h1]:font-semibold [&>h1]:text-white [&>h1]:mt-4 [&>h1]:mb-2 [&>h1]:tracking-tight
        [&>h2]:text-base [&>h2]:font-semibold [&>h2]:text-white [&>h2]:mt-3.5 [&>h2]:mb-2 [&>h2]:tracking-tight
        [&>h3]:text-[15px] [&>h3]:font-medium [&>h3]:text-neutral-100 [&>h3]:mt-3 [&>h3]:mb-1.5
        [&>blockquote]:border-l-2 [&>blockquote]:border-neutral-700 [&>blockquote]:pl-4 [&>blockquote]:my-3 [&>blockquote]:text-neutral-400 [&>blockquote]:italic
        [&>table]:w-full [&>table]:border-collapse [&>table]:my-3 [&>table]:text-xs
        [&>table_th]:border [&>table_th]:border-neutral-800 [&>table_th]:bg-neutral-900 [&>table_th]:p-2 [&>table_th]:text-left [&>table_th]:font-semibold [&>table_th]:text-white
        [&>table_td]:border [&>table_td]:border-neutral-800 [&>table_td]:p-2 [&>table_td]:text-neutral-300
        [&_code]:font-mono [&_code]:text-xs [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-neutral-800/90 [&_code]:text-neutral-200 [&_code]:border [&_code]:border-neutral-700/50
        [&_pre]:my-3 [&_pre]:p-3.5 [&_pre]:rounded-lg [&_pre]:bg-neutral-900 [&_pre]:border [&_pre]:border-neutral-800 [&_pre]:overflow-x-auto
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:border-none [&_pre_code]:text-neutral-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
