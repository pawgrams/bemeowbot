import { Context } from 'telegraf';

////////////////////////////////////////////////////////////////

export type MessageMetadata = {
    user_name: string;
    message_id: string;
    created_at: number;
};

export type Message = {
    role: "user" | "assistant";
    content: string;
  };

export type Role = "user" | "assistant";

export type Msg = {
  role: Role;
  content: string
};

export type RunAndThreadId = {
  run: any | null;
  threadId: string;
};

export type MsgType = "none" | "text" | "photo" | "animation" |"audio" | "document" | "sticker";

export type TextReply = {
  text: string;
  userid: string;
};

export function isContext(obj: any): obj is Context {
    return obj && typeof obj === 'object' && 'updateType' in obj && 'update' in obj;
}

