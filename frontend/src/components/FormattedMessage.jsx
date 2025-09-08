import React from "react";

const FormattedMessage = ({ message }) => {
  // Function to format the AI response text
  const formatMessage = (text) => {
    if (!text) return "";

    // Split by double newlines to create paragraphs
    const paragraphs = text.split("\n\n").filter((p) => p.trim());

    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();

      // Check if it's a numbered list item (1., 2., etc.)
      if (/^\d+\.\s/.test(trimmedParagraph)) {
        return (
          <div key={index} className="mb-3">
            <div className="flex items-start">
              <span className="text-blue-600 font-semibold mr-3 mt-1 min-w-[2rem]">
                {trimmedParagraph.match(/^\d+/)[0]}.
              </span>
              <span className="text-gray-800 leading-relaxed">
                {trimmedParagraph.replace(/^\d+\.\s/, "")}
              </span>
            </div>
          </div>
        );
      }

      // Check if it's a bullet point (-, *, •)
      if (/^[-*•]\s/.test(trimmedParagraph)) {
        return (
          <div key={index} className="mb-2 ml-2">
            <div className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              <span className="text-gray-800 leading-relaxed">
                {trimmedParagraph.replace(/^[-*•]\s/, "")}
              </span>
            </div>
          </div>
        );
      }

      // Check if it's a header (starts with ** or ##)
      if (
        /^\*\*.*\*\*$/.test(trimmedParagraph) ||
        /^##\s/.test(trimmedParagraph)
      ) {
        const headerText = trimmedParagraph
          .replace(/^\*\*|\*\*$/g, "")
          .replace(/^##\s/, "");
        return (
          <h3
            key={index}
            className="text-lg font-bold text-gray-900 mb-3 mt-6 first:mt-0 border-b border-gray-200 pb-2"
          >
            {headerText}
          </h3>
        );
      }

      // Check if it's a subheader (starts with ###)
      if (/^###\s/.test(trimmedParagraph)) {
        const subheaderText = trimmedParagraph.replace(/^###\s/, "");
        return (
          <h4
            key={index}
            className="text-base font-semibold text-gray-800 mb-2 mt-4"
          >
            {subheaderText}
          </h4>
        );
      }

      // Check if it contains bold text (**text**)
      if (/\*\*.*\*\*/.test(trimmedParagraph)) {
        const parts = trimmedParagraph.split(/(\*\*.*?\*\*)/);
        return (
          <p key={index} className="mb-3 text-gray-800 leading-relaxed">
            {parts.map((part, partIndex) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={partIndex} className="font-bold text-gray-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="mb-3 text-gray-800 leading-relaxed">
          {trimmedParagraph}
        </p>
      );
    });
  };

  return (
    <div className="formatted-message prose prose-sm max-w-none">
      <div className="space-y-1">{formatMessage(message)}</div>
    </div>
  );
};

export default FormattedMessage;
