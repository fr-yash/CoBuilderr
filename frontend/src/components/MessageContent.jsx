import Markdown from "markdown-to-jsx";
import React from "react";

const MessageContent = ({ message, isCurrentUser }) => {
  const isAIMessage = message.sender === "AI";

  if (isAIMessage) {
    return (
      <div className="ai-message-content">
        <Markdown
          options={{
            overrides: {
              // Custom styling for markdown elements in AI messages
              h1: { props: { className: 'text-lg font-bold mb-3 text-gray-800' } },
              h2: { props: { className: 'text-base font-bold mb-2 text-gray-800' } },
              h3: { props: { className: 'text-sm font-bold mb-2 text-gray-800' } },
              h4: { props: { className: 'text-sm font-semibold mb-1 text-gray-800' } },
              p: { props: { className: 'text-sm text-gray-700 mb-2 last:mb-0 leading-relaxed' } },
              ul: { props: { className: 'list-disc list-inside text-sm text-gray-700 mb-2 ml-2' } },
              ol: { props: { className: 'list-decimal list-inside text-sm text-gray-700 mb-2 ml-2' } },
              li: { props: { className: 'mb-1 leading-relaxed' } },
              strong: { props: { className: 'font-bold text-gray-800' } },
              em: { props: { className: 'italic text-gray-700' } },
              a: { props: { className: 'text-blue-600 hover:text-blue-800 underline' } },
              hr: { props: { className: 'border-gray-300 my-3' } },
            }
          }}
        >
          {message.text}
        </Markdown>
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
