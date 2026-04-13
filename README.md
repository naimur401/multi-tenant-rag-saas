cd D:\raag-saas

@"
# 📚 Multi-tenant AI Knowledge Base SaaS (RAG-powered)

A production-ready, full-stack SaaS application for document Q&A using RAG.

## 🚀 Features

- **Multi-tenant Architecture** - Workspace-based isolation
- **JWT Authentication** - Secure user authentication
- **Document Upload** - PDF & Text support
- **RAG Pipeline** - Chunking, Embeddings, Vector Search
- **Source Citation** - Shows which document provided the answer
- **Chat History** - Persistent conversation storage
- **Rate Limiting** - API abuse prevention

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, JWT  
**Frontend:** Next.js, Tailwind CSS, TypeScript  
**AI:** Transformers.js (all-MiniLM-L6-v2), Cosine Similarity

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/naimur401/rag-saas.git
cd rag-saas

# Backend setup
cd server
npm install
cp .env.example .env
npm run dev

# Frontend setup (new terminal)
cd client
npm install
npm run dev
