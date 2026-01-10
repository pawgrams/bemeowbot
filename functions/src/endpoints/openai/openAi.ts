import OpenAI from "openai";
import { _openai } from "../../context/cache/access"
export const openai: OpenAI = new OpenAI({
    apiKey: _openai,
    defaultHeaders: {"OpenAI-Beta": "assistants=v2"} 
});
export const client: OpenAI = new OpenAI({
    apiKey: _openai,
});


