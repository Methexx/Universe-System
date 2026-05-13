"use client";

import { MessagesContainer } from "@/features/messages/components/MessagesContainer";

export default function AdminMessagesPage() {
  return (
    <MessagesContainer 
      accentColor="#1e293b"
      accentBg="#f1f5f9"
      accentLight="#e2e8f0"
      pageTitle="Internal Messages"
      pageSubtitleEmpty="All caught up"
      footerNote="Messages are sent via internal secure channels."
      showAiDraft={false}
    />
  );
}
