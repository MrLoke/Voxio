"use client";

import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import React from "react";

interface Props {
  type: "mention" | "hashtag";
  value: string;
  children: React.ReactNode;
}

export function MentionTag({ type, value, children }: Props) {
  const label = type === "mention" ? `@${value}` : `#${value}`;

  const url =
    type === "mention"
      ? `/user/${encodeURIComponent(value)}`
      : `/tag/${encodeURIComponent(value)}`;

  return (
    <Tooltip.Provider>
      <Popover.Root>
        <Popover.Trigger asChild>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span
                className={
                  type === "mention"
                    ? "text-indigo-400 hover:underline cursor-pointer font-medium"
                    : "text-emerald-400 hover:underline cursor-pointer font-medium"
                }
              >
                {children}
              </span>
            </Tooltip.Trigger>

            <Tooltip.Content
              className="
                p-2 text-xs bg-black/80 text-white 
                rounded-md border border-white/10 shadow-xl
              "
              side="top"
            >
              Kliknij żeby otworzyć profil
              <Tooltip.Arrow className="fill-black/80" />
            </Tooltip.Content>
          </Tooltip.Root>
        </Popover.Trigger>

        <Popover.Content
          align="start"
          side="bottom"
          className="
            w-64 p-4 rounded-xl bg-white/10 backdrop-blur 
            border border-white/15 shadow-xl 
            animate-in fade-in slide-in-from-top-2
          "
        >
          <div className="font-semibold text-white mb-1">{label}</div>

          <div className="text-sm text-white/80">
            Profil użytkownika / strona taga.
            <br />
            Tutaj możesz dodać fetch do Supabase:
            <br />
            <code>SELECT * FROM profiles WHERE username = ...</code>
          </div>

          <a href={url} className="text-sky-400 underline text-sm block mt-2">
            Przejdź do pełnego profilu →
          </a>
        </Popover.Content>
      </Popover.Root>
    </Tooltip.Provider>
  );
}
