"use client";

import { MessagesContainer } from "@/features/messages/components/MessagesContainer";

export default function TeacherMessagesPage() {
  return (
    <MessagesContainer 
      accentColor="#4f46e5"
      accentBg="#eef2ff"
      accentLight="#e0e7ff"
      pageTitle="Messages"
      pageSubtitleEmpty="All caught up"
      footerNote="Parent receives an FCM push notification when you send a message."
      showAiDraft={true}
    />
  );
}