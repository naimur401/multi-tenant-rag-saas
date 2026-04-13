'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import PDFUploader from '@/components/PDFUploader';

interface Workspace {
  _id: string;
  name: string;
  ownerId: string;
  members: string[];
  plan: string;
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) {
      router.push('/');
    } else {
      fetchWorkspaces();
    }
  }, [token, router]);

  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/workspace/my-workspaces', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWorkspaces(res.data.workspaces);
    } catch (error) {
      toast.error('Failed to fetch workspaces');
    }
  };

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    try {
      const res = await axios.post('http://localhost:5000/api/workspace/create', 
        { name: newWorkspaceName },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setWorkspaces([...workspaces, res.data.workspace]);
      setNewWorkspaceName('');
      toast.success('Workspace created!');
    } catch (error) {
      toast.error('Failed to create workspace');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">📚 RAG SaaS</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Workspace List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Workspaces</h2>
            <form onSubmit={createWorkspace} className="mb-4">
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="New workspace name"
                className="w-full px-3 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
              >
                + Create Workspace
              </button>
            </form>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => setSelectedWorkspace(ws)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedWorkspace?._id === ws._id
                      ? 'bg-blue-100 border border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{ws.name}</div>
                  <div className="text-sm text-gray-500">{ws.plan}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            {selectedWorkspace ? (
              <div className="space-y-4">
                {/* PDF Uploader */}
                <PDFUploader 
                  workspaceId={selectedWorkspace._id} 
                  onUploadSuccess={() => setRefreshKey(prev => prev + 1)}
                />
                <div className="border-t pt-4">
                  <ChatInterface 
                    key={refreshKey}
                    workspaceId={selectedWorkspace._id} 
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20">
                Select a workspace to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat Interface Component
function ChatInterface({ workspaceId }: { workspaceId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/chat/query', {
        workspaceId,
        question,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const assistantMessage = { role: 'assistant', content: res.data.answer };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to get answer');
      // Remove the user message if failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setQuestion('');
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            📄 Upload a PDF or text, then ask questions about it!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">🤔 Thinking...</div>
          </div>
        )}
      </div>
      <form onSubmit={sendQuestion} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about your documents..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}