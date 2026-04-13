const { chunkText } = require('./pdfProcessor');

// In-memory vector storage (for demo)
let documentChunks = []; // { workspaceId, chunk, fileName }

async function addDocumentChunks(workspaceId, chunks, fileName) {
  for (const chunk of chunks) {
    documentChunks.push({ workspaceId, chunk, fileName });
  }
}

async function searchRelevantChunks(workspaceId, question, topK = 3) {
  // Simple keyword-based search (for demo)
  const questionWords = question.toLowerCase().split(' ');
  
  const scored = documentChunks
    .filter(c => c.workspaceId === workspaceId)
    .map(chunk => {
      let score = 0;
      questionWords.forEach(word => {
        if (chunk.chunk.toLowerCase().includes(word)) score++;
      });
      return { ...chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  return scored;
}

async function askQuestion(workspaceId, question) {
  // Search relevant chunks
  const relevantChunks = await searchRelevantChunks(workspaceId, question);
  
  if (relevantChunks.length === 0) {
    return "📄 No relevant documents found. Please upload PDF files to your workspace first.";
  }
  
  // Build context
  const context = relevantChunks.map(c => c.chunk).join('\n\n');
  const sources = [...new Set(relevantChunks.map(c => c.fileName))];
  
  // Simple rule-based answer (for demo - replace with real LLM)
  const lowerQuestion = question.toLowerCase();
  let answer = "";
  
  if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
    answer = "👋 Hello! I can answer questions based on your uploaded documents.";
  } else {
    // Find most relevant sentence from chunks
    const bestMatch = relevantChunks[0];
    const sentences = bestMatch.chunk.split(/[.!?]+/);
    let found = sentences.find(s => 
      lowerQuestion.split(' ').some(word => s.toLowerCase().includes(word) && word.length > 3)
    );
    
    answer = found || bestMatch.chunk.substring(0, 300);
  }
  
  return {
    answer: `${answer}\n\n📚 Sources: ${sources.join(', ')}`,
    sources
  };
}

module.exports = { askQuestion, addDocumentChunks };