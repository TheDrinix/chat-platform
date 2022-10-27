import type { User } from "@/interfaces/user";
import type { Message } from "@/interfaces/message";

export interface ChatData {
  id: number;
  type: ChatType;
  name: string;
  members: User[];
  owner: User | null;
}

export interface Chat extends ChatData {
  messages: Map<number, Message>;
}

export type ChatType = 'private' | 'group';

export interface ChatsStore {
 chats: Map<number, Chat>
}