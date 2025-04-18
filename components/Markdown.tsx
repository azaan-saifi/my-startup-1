import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";

export interface MarkdownProps {
  children: string;
  onTimestampClick?: (seconds: number, videoId: string) => void;
  currentVideoId?: string;
}

export const NonMemoizedMarkdown = ({
  children,
  onTimestampClick,
  currentVideoId,
}: MarkdownProps) => {
  return (
    <ReactMarkdown
      components={{
        code({ children, ...props }) {
          return (
            <code
              className="rounded-md border border-zinc-800 bg-zinc-800/50 px-1 font-['monospace']"
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children, ...props }) {
          return (
            <p className="mb-4 w-full text-zinc-300 last:mb-0" {...props}>
              {children}
            </p>
          );
        },
        ol({ children, ...props }) {
          return (
            <ol className="mb-4 list-decimal pl-8 text-zinc-300" {...props}>
              {children}
            </ol>
          );
        },
        ul({ children, ...props }) {
          return (
            <ul className="mb-4 list-disc pl-8 text-zinc-300" {...props}>
              {children}
            </ul>
          );
        },
        li({ children, ...props }) {
          return (
            <li className="mb-1 text-zinc-300" {...props}>
              {children}
            </li>
          );
        },
        a({ children, href, ...props }) {
          // Handle YouTube timestamp links
          if (href && onTimestampClick) {
            try {
              // Try parsing as URL
              const url = new URL(href);
              const videoId = url.searchParams.get("v");
              let timestamp = url.searchParams.get("t");

              if (timestamp) {
                // Handle formats like t=123s
                if (timestamp.endsWith("s")) {
                  timestamp = timestamp.substring(0, timestamp.length - 1);
                }

                const seconds = Number(timestamp);
                if (!isNaN(seconds)) {
                  return (
                    <button
                      className="rounded-full bg-[#f0bb1c] px-2 py-0 text-sm font-semibold text-black hover:bg-[#f0bb1c]/80 hover:transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        onTimestampClick(
                          seconds,
                          videoId || currentVideoId || ""
                        );
                      }}
                    >
                      {children}
                    </button>
                  );
                }
              }
            } catch {
              // Not a valid URL, try parsing as a timestamp format
              const timeRegex = /(\d+):(\d+)/;
              const match = href.match(timeRegex);
              if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const totalSeconds = minutes * 60 + seconds;

                return (
                  <button
                    className="rounded-full bg-[#f0bb1c] px-2 py-0 text-sm font-semibold text-black hover:bg-[#f0bb1c]/80 hover:transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      onTimestampClick(totalSeconds, currentVideoId || "");
                    }}
                  >
                    {children}
                  </button>
                );
              }
            }
          }

          // Internal links
          if (href?.startsWith("/")) {
            return (
              <Link
                href={href}
                className="ml-1 rounded-sm bg-[#f0bb1c] px-2 py-1 text-black hover:bg-[#f0bb1c]/80 hover:transition-all"
                {...props}
              >
                {children}
              </Link>
            );
          }

          // External links
          return (
            <a
              href={href}
              className="break-all text-[#f0bb1c] underline hover:text-[#f0bb1c]/80"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
        h1({ children }) {
          return <h1 className="text-3xl font-bold text-white">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-2xl font-bold text-white">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-xl font-bold text-white">{children}</h3>;
        },
        h4({ children }) {
          return <h4 className="text-lg font-bold text-white">{children}</h4>;
        },
        h5({ children }) {
          return <h5 className="text-base font-bold text-white">{children}</h5>;
        },
        h6({ children }) {
          return <h6 className="text-sm font-bold text-white">{children}</h6>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = React.memo(NonMemoizedMarkdown, (prev, next) => {
  return prev.children === next.children;
});
