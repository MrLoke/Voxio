// File: src/components/ReplyPreview.tsx

import React from "react";
interface Message {
  id: number;
  content: string;
  username: string;
  attachmentUrl?: string | null;
  // isFile: boolean;
  // fileType?: string;
}

interface ReplyPreviewProps {
  message: Message;
  onCancel: () => void;
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({ message, onCancel }) => {
  const getPreviewContent = (msg: Message): string => {
    if (!msg.content && msg.attachmentUrl) {
      const filename = msg.attachmentUrl.split("/").pop() || "Plik";
      return `[Załącznik: ${filename}]`;
    }
    const MAX_LENGTH = 70;
    return msg.content.length > MAX_LENGTH
      ? msg.content.substring(0, MAX_LENGTH - 3) + "..."
      : msg.content;
  };

  return (
    <div className="flex items-center w-full bg-gray-700/80 p-3 shadow-2xl">
      <div className="w-1 h-12 bg-blue-500 rounded mr-3 shrink-0"></div>

      <div className="flex flex-col grow min-w-0 overflow-hidden">
        <span className="font-semibold text-blue-400 text-sm truncate">
          Odp. do {message.username}
        </span>
        <span className="text-gray-300 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
          {getPreviewContent(message)}
        </span>
      </div>

      <button
        onClick={onCancel}
        className="ml-4 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-600 transition-colors flex-shrink-0"
        aria-label="Anuluj odpowiadanie"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default ReplyPreview;
