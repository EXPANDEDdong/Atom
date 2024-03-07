"use server";

import { pipeline } from "@xenova/transformers";

export async function initializeEmbeddingPipeline() {
  const pipelineInstance = await pipeline(
    "feature-extraction",
    "Supabase/gte-small"
  );
  return async function generateEmbedding(text: string) {
    const embedding = await pipelineInstance(text, {
      pooling: "mean",
      normalize: true,
    });

    const embeddingData: number[] = Object.values(embedding.data);
    return embeddingData;
  };
}
