// Adapted documented HeroUI Pro example; see ../README.md.
"use client";

import type {PendingAttachment} from "./attachments.utils";

import {ChatAttachment, ChatAttachmentGroup, PromptInput} from "@vezham/react-pro-v3";

type DemoAttachmentPreviewsProps = {
  attachments: PendingAttachment[];
  onRemove: (id: string) => void;
};

export function DemoAttachmentPreviews({attachments, onRemove}: DemoAttachmentPreviewsProps) {
  if (!attachments.length) return null;

  return (
    <PromptInput.Attachments>
      <ChatAttachmentGroup>
        {attachments.map((file) => (
          <ChatAttachment key={file.id} mimeType={file.mimeType} name={file.name} src={file.src}>
            <ChatAttachment.Preview />
            <ChatAttachment.Remove
              aria-label="Remove attachment"
              onPress={() => onRemove(file.id)}
            />
          </ChatAttachment>
        ))}
      </ChatAttachmentGroup>
    </PromptInput.Attachments>
  );
}
