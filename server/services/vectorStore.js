// সিম্পল মেমোরি-বেসড ভেক্টর স্টোর (কোনো অতিরিক্ত প্যাকেজ লাগবে না)
let vectors = []; // { workspaceId, vector, chunk, fileName }

async function addVector(vector, meta) {
  vectors.push({
    vector: vector,
    workspaceId: meta.workspaceId,
    chunk: meta.chunk,
    fileName: meta.fileName
  });
  console.log(`📊 Added vector. Total: ${vectors.length}`);
}

// কোসাইন সিমিলারিটি 계산
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function searchSimilar(vector, topK = 5, workspaceId) {
  // ওয়ার্কস্পেস অনুযায়ী ফিল্টার করুন
  const workspaceVectors = vectors.filter(v => v.workspaceId === workspaceId);
  
  if (workspaceVectors.length === 0) return [];
  
  // সিমিলারিটি স্কোর計算 করুন
  const scored = workspaceVectors.map(v => ({
    score: cosineSimilarity(vector, v.vector),
    chunk: v.chunk,
    fileName: v.fileName
  }));
  
  // স্কোর অনুযায়ী সাজান
  scored.sort((a, b) => b.score - a.score);
  
  // টপ-কে রিটার্ন করুন
  return scored.slice(0, topK);
}

async function getIndexStats() {
  return { total: vectors.length };
}

module.exports = { addVector, searchSimilar, getIndexStats };