export type SendEmailAttachment = {
  content?: string | Buffer;
  path?: string;
  filename: string;
  contentType?: string;
  contentId?: string;
};

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: SendEmailAttachment[];
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
