"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyButtonProps = {
  textToCopy: string;
  className?: string;
  iconSize?: number;
};

export function CopyButton({ textToCopy, className = "", iconSize = 14 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin teks:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center justify-center rounded-md p-1.5 text-ink/50 hover:bg-ink/5 hover:text-ink transition ${className}`}
      title="Salin"
    >
      {copied ? <Check size={iconSize} className="text-leaf" /> : <Copy size={iconSize} />}
    </button>
  );
}
