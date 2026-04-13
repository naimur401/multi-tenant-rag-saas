const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractTextFromPDF(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return '';
    }
    
    const dataBuffer = fs.readFileSync(filePath);
    // Use pdfParse correctly
    const data = await pdfParse(dataBuffer);
    
    console.log(`📄 Extracted ${data.text.length} characters from PDF`);
    return data.text || '';
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    return '';
  }
}

function chunkText(text, chunkSize = 500, overlap = 100) {
  if (!text || text.length === 0) {
    console.log('⚠️ No text to chunk');
    return [];
  }
  
  console.log(`🔪 Chunking ${text.length} characters with size ${chunkSize}, overlap ${overlap}`);
  
  // Simple sentence splitting
  const sentences = text.split(/[.!?]+/);
  const chunks = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) continue;
    
    // Check if adding this sentence exceeds chunk size
    const newLength = currentChunk.length + trimmed.length + 1;
    
    if (newLength > chunkSize && currentChunk.length > 0) {
      // Push current chunk
      chunks.push(currentChunk.trim());
      
      // Add overlap: keep last few words
      const words = currentChunk.split(' ');
      const overlapWords = Math.floor(overlap / 5);
      const overlapText = words.slice(-overlapWords).join(' ');
      currentChunk = overlapText + ' ' + trimmed;
    } else {
      // Add to current chunk
      currentChunk += (currentChunk ? ' ' : '') + trimmed;
    }
  }
  
  // Add last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  console.log(`✅ Created ${chunks.length} chunks`);
  
  // Log first chunk preview
  if (chunks.length > 0) {
    console.log(`📝 First chunk preview: ${chunks[0].substring(0, 100)}...`);
  }
  
  return chunks;
}

// Simple chunking by fixed size
function chunkTextSimple(text, chunkSize = 500, overlap = 100) {
  if (!text || text.length === 0) return [];
  
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.substring(start, end);
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }
    start += chunkSize - overlap;
  }
  
  console.log(`✅ Created ${chunks.length} chunks (simple method)`);
  return chunks;
}

module.exports = { extractTextFromPDF, chunkText, chunkTextSimple };