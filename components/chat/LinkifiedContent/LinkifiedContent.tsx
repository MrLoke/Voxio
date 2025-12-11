"use client";

import React, { useMemo } from "react";
import { LinkPreview } from "../LinkPreview/LinkPreview";

/**
 * Tokenizer regex and order matters:
 *  - URL with protocol
 *  - URL without protocol (www.example.com)
 *  - email
 *  - mention @user
 *  - hashtag #tag (unicode included)
 *  - IP address 127.0.0.1
 *  - fallback any single char (we will merge adjacent text pieces)
 *
 * We'll create tokens in order and then render them.
 */

/* ---------- TYPES ---------- */
type Token = {
  type: "url" | "mention" | "hashtag" | "email" | "ip" | "text";
  text: string;
  href?: string;
  mailto?: string;
  username?: string;
  tag?: string;
  ip?: string;
};

interface Props {
  text: string;
}

/* ---------- HELPERS ---------- */

// Absolutize URL if missing protocol
function absolutizeHref(href: string) {
  if (/^https?:\/\//i.test(href)) return href;
  return "https://" + href;
}

// Safe text => escape not needed for React, but trim
function normalizeText(t: string) {
  return t;
}

/* Regex components:
 - URL with protocol: https?://... (simple)
 - URL without protocol starting with www. or something.tld
 - email: basic
 - mention: @\w[\w.-]*
 - hashtag: # with unicode chars (letters, digits, underscores, emoji)
 - ip: IPv4 simple 4 groups
*/
const URL_WITH_PROTOCOL = /https?:\/\/[^\s<>"'`]+/i;
const URL_WWW = /(?:www\.)[^\s<>"'`]+/i;
const EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const MENTION = /@[\p{L}\p{N}_\-.]+/u; // unicode letters & numbers
const HASHTAG = /#[\p{L}\p{N}_\-_]+/u;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

// We combine into one global regex - order matters (urls first)
const MASTER_REGEX = new RegExp(
  [
    URL_WITH_PROTOCOL.source,
    URL_WWW.source,
    EMAIL.source,
    MENTION.source,
    HASHTAG.source,
    IPV4.source,
  ].join("|"),
  "giu"
);

/* ---------- TOKENIZER ---------- */
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  // iterate matches
  let m: RegExpExecArray | null;
  // reset lastIndex in case
  MASTER_REGEX.lastIndex = 0;

  while ((m = MASTER_REGEX.exec(input))) {
    const idx = m.index;
    // push text before match
    if (idx > lastIndex) {
      const textBefore = input.slice(lastIndex, idx);
      tokens.push({ type: "text", text: normalizeText(textBefore) });
    }

    const match = m[0];

    // determine which group matched by checking patterns
    if (match.match(new RegExp("^" + URL_WITH_PROTOCOL.source, "i"))) {
      tokens.push({ type: "url", text: match, href: absolutizeHref(match) });
    } else if (match.match(new RegExp("^" + URL_WWW.source, "i"))) {
      tokens.push({ type: "url", text: match, href: absolutizeHref(match) });
    } else if (match.match(new RegExp("^" + EMAIL.source, "i"))) {
      tokens.push({ type: "email", text: match, mailto: `mailto:${match}` });
    } else if (match.match(new RegExp("^" + MENTION.source, "u"))) {
      tokens.push({
        type: "mention",
        text: match,
        username: match.replace(/^@/, ""),
      });
    } else if (match.match(new RegExp("^" + HASHTAG.source, "u"))) {
      tokens.push({
        type: "hashtag",
        text: match,
        tag: match.replace(/^#/, ""),
      });
    } else if (match.match(new RegExp("^" + IPV4.source))) {
      tokens.push({ type: "ip", text: match, ip: match });
    } else {
      // fallback
      tokens.push({ type: "text", text: match });
    }

    lastIndex = MASTER_REGEX.lastIndex;
  }

  // push trailing text
  if (lastIndex < input.length) {
    tokens.push({ type: "text", text: normalizeText(input.slice(lastIndex)) });
  }

  // Merge adjacent text tokens for cleaner output
  const merged: Token[] = [];
  for (const t of tokens) {
    const last = merged[merged.length - 1];
    if (t.type === "text" && last && last.type === "text") {
      last.text += t.text;
    } else {
      merged.push(t);
    }
  }

  return merged;
}

/* ---------- COMPONENT ---------- */
export const LinkifiedContent: React.FC<Props> = ({ text }) => {
  const tokens = useMemo(() => tokenize(text), [text]);

  return (
    <div className="flex flex-col gap-2">
      <div className="leading-relaxed wrap-break-word whitespace-pre-wrap text-sm">
        {tokens.map((token: Token, idx) => {
          switch (token.type) {
            case "text":
              return (
                <span key={idx} className="whitespace-pre-wrap">
                  {token.text}
                </span>
              );

            case "url": {
              // Render LinkPreview inline + visible anchor (LinkPreview will fallback to anchor if preview fails)
              // show display text trimmed if too long
              const display =
                token.text.length > 160
                  ? token.text.slice(0, 157) + "..."
                  : token.text;
              return (
                <span key={idx} className="inline-block wrap-break-word">
                  <LinkPreview href={token.href ?? ""}>{display}</LinkPreview>
                </span>
              );
            }

            case "mention": {
              return (
                <a
                  key={idx}
                  href={`/user/${encodeURIComponent(token?.username || "")}`}
                  className="text-indigo-400 hover:underline font-medium ml-0 mr-0"
                  data-mention={token.username}
                  title={`Mention: @${token.username}`}
                >
                  {token.text}
                </a>
              );
            }

            case "hashtag": {
              return (
                <a
                  key={idx}
                  href={`/tag/${encodeURIComponent(token?.tag || "")}`}
                  className="text-emerald-400 hover:underline font-medium"
                  data-hashtag={token.tag}
                  title={`Hashtag: #${token.tag}`}
                >
                  {token.text}
                </a>
              );
            }

            case "email": {
              return (
                <a
                  key={idx}
                  href={token.mailto}
                  className="text-sky-500 hover:underline"
                  title={token.mailto}
                >
                  {token.text}
                </a>
              );
            }

            case "ip": {
              return (
                <a
                  key={idx}
                  href={`http://${token.ip}`}
                  className="text-yellow-400 hover:underline"
                  title={`IP: ${token.ip}`}
                >
                  {token.text}
                </a>
              );
            }

            default:
              return (
                <span key={idx} className="whitespace-pre-wrap">
                  {token.text}
                </span>
              );
          }
        })}
      </div>
    </div>
  );
};
