import { embed, embedMany } from "ai";
import { models } from "./ai";

export async function embedText(text: string): Promise<number[]> {
  const model = models.embedding;
  if (!model) return [];
  try {
    const { embedding } = await embed({
      model,
      value: text.slice(0, 8000),
    });
    return embedding;
  } catch {
    return [];
  }
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const model = models.embedding;
  if (texts.length === 0 || !model) return [];
  try {
    const { embeddings } = await embedMany({
      model,
      values: texts.map((t) => t.slice(0, 8000)),
    });
    return embeddings;
  } catch {
    return [];
  }
}


export function averageVectors(vectors: number[][]): number[] {
  if (vectors.length === 0) return [];
  const dim = vectors[0].length;
  const sum = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) sum[i] += v[i];
  }
  return sum.map((x) => x / vectors.length);
}
