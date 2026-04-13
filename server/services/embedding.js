const { pipeline } = require('@xenova/transformers');

let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    console.log('🔄 Loading embedding model...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model loaded!');
  }
  return embedder;
}

async function getEmbedding(text) {
  const embedderFn = await getEmbedder();
  const result = await embedderFn(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

module.exports = { getEmbedding };