"use client";

import { type Dictionary } from "@/lib/i18n/get-dictionary";
import { type Locale } from "@/lib/i18n/config";
import { Share2, MessageCircle, Send, ExternalLink, Mail } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  dict: Dictionary;
  locale: Locale;
}

export function ShareButtons({ url, title, dict, locale }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shares = [
    {
      name: "Twitter",
      icon: Send,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-sky-100 hover:text-sky-600 dark:hover:bg-sky-900",
    },
    {
      name: "Facebook",
      icon: ExternalLink,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900",
    },
    {
      name: "LinkedIn",
      icon: Mail,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <Share2 className="h-4 w-4 text-muted" />
      <span className="text-sm font-medium">{dict.concours.share}:</span>
      {shares.map((share) => {
        const Icon = share.icon;
        return (
          <a
            key={share.name}
            href={share.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-lg border border-border p-2 transition-colors ${share.color}`}
            aria-label={`Share on ${share.name}`}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
