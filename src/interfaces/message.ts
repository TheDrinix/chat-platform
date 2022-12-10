import type { User } from "@/interfaces/user";
import type { ChatData } from "@/interfaces/chat";

export interface MessageData {
  id: number;
  text: string;
  author: User;
  chat: ChatData;
  createdAt: Date;
  attachments?: Attachment[];
}

export interface Message {
  id: number;
  text: string;
  author: User;
  createdAt: Date;
  attachment?: Attachment;
}

export interface Attachment {
  id: number;
  filename: string;
  originalFilename: string;
  mimetype: string;
  urlPath: string;
}