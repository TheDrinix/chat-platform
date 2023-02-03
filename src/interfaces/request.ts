import type { ChatData, ChatType } from "@/interfaces/chat";
import type { User } from "@/interfaces/user";

export interface ChatRequest {
  id: number;
  to: ChatType;
  sender: User;
  receiver: User;
  chat: ChatData;
}

export interface ChatRequestsStore {
  received: ChatRequest[];
  sent: ChatRequest[];
}

export type ChatRequestType = 'received' | 'sent';