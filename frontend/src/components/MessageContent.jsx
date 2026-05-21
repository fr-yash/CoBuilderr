import Markdown from "markdown-to-jsx";
import React from "react";
import CodeBlockRenderer from "./ai/CodeBlockRenderer";
import { extractCodeBlocks, splitMarkdownByCodeBlocks } from "../utils/extractCodeBlocks";

const MessageContent = ({
  message,
  isCurrentUser,
  onInsertCode,
}) => {
  const isAIMessage = message.sender === "AI";

  if (isAIMessage) {
    const allBlocks = extractCodeBlocks(message.text);
    const parts = splitMarkdownByCodeBlocks(message.text);

    if (allBlocks.length === 1 && allBlocks[0].id === "loose-0") {
      return (
        <div className="ai-message-content">
          <CodeBlockRenderer
            block={allBlocks[0]}
            onInsertCode={onInsertCode}
          />
        </div>
      );
    }

    return (
      <div className="ai-message-content">
        {parts.map((part, index) => {
          if (part.type === "code") {
            return (
              <CodeBlockRenderer
                key={part.block.id || index}
                block={part.block}
                onInsertCode={onInsertCode}
              />
            );
          }

          if (!part.text.trim()) return null;

          return (
            <Markdown
              key={`markdown-${index}`}
              options={{
                overrides: {
                  // Custom styling for markdown elements in AI messages (updated for dark background)
                  h1: { props: { className: 'text-lg font-bold mb-3 text-white' } },
                  h2: { props: { className: 'text-base font-bold mb-2 text-gray-100' } },
                  h3: { props: { className: 'text-sm font-bold mb-2 text-gray-200' } },
                  h4: { props: { className: 'text-sm font-semibold mb-1 text-gray-200' } },
                  p: { props: { className: 'text-sm text-gray-300 mb-2 last:mb-0 leading-relaxed' } },
                  ul: { props: { className: 'list-disc list-inside text-sm text-gray-300 mb-2 ml-2' } },
                  ol: { props: { className: 'list-decimal list-inside text-sm text-gray-300 mb-2 ml-2' } },
                  li: { props: { className: 'mb-1 leading-relaxed' } },
                  strong: { props: { className: 'font-bold text-white' } },
                  em: { props: { className: 'italic text-gray-300' } },
                  a: { props: { className: 'text-blue-400 hover:text-blue-300 underline' } },
                  hr: { props: { className: 'border-gray-600 my-3' } },
                }
              }}
            >
              {part.text}
            </Markdown>
          );
        })}
      </div>
    );
  }

  // Regular text message for non-AI messages
  return (
    <p className={`text-sm break-words ${
      isCurrentUser ? 'text-white' : 'text-gray-700'
    }`}>
      {message.text}
    </p>
  );
};

export default MessageContent;
