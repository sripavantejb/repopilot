import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

// Default AI provider setup: Google Generative AI (Gemini / Gemma) or Vercel AI Gateway
const googleKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
export const googleAI = googleKey ? createGoogleGenerativeAI({ apiKey: googleKey }) : null;

export const gateway = process.env.AI_GATEWAY_API_KEY
  ? createOpenAI({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      baseURL: "https://ai-gateway.vercel.sh/v1",
    })
  : null;

export const models = {
  /** Deep reasoning — PR analysis, chat, code understanding (Gemma 4 powered) */
  sonnet: googleAI
    ? googleAI("gemma-4-26b-a4b-it")
    : gateway
    ? gateway("anthropic/claude-sonnet-4-6")
    : null,
  /** Fast triage */
  haiku: googleAI
    ? googleAI("gemma-4-26b-a4b-it")
    : gateway
    ? gateway("anthropic/claude-haiku-4-5")
    : null,
  /** Embeddings */
  embedding: gateway ? gateway.embedding("openai/text-embedding-3-small") : null,
} as const;

/**
 * Returns a language model for the given BYOK key.
 * Supports Anthropic (sk-ant-), Google/Gemma/Gemini (AQ. or AIza), and Groq (gsk_).
 * Falls back to the production Gemma model if no valid key is provided.
 */
export function getModelForKey(byokKey?: string | null): LanguageModel {
  const effectiveKey = byokKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (effectiveKey?.startsWith("AQ.") || effectiveKey?.startsWith("AIza")) {
    return createGoogleGenerativeAI({ apiKey: effectiveKey })("gemma-4-26b-a4b-it");
  }
  if (byokKey?.startsWith("sk-ant-")) {
    return createAnthropic({ apiKey: byokKey })("claude-sonnet-4-6");
  }
  if (byokKey?.startsWith("gsk_")) {
    return createGroq({ apiKey: byokKey })("llama-3.3-70b-versatile");
  }
  return models.sonnet!;
}
