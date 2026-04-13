'use client';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TextUploaderProps {
  workspaceId: string;
  onUploadSuccess: () => void;
}

export default function TextUploader({ workspaceId, onUploadSuccess }: TextUploaderProps) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/docs/upload-text', {
        workspaceId,
        text: text,
        fileName: fileName || 'document.txt'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(`Text uploaded! Processed ${res.data.chunks} chunks`);
        setText('');
        setFileName('');
        onUploadSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-2">Upload Text</h3>
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        placeholder="File name (optional)"
        className="w-full px-3 py-2 border rounded-lg mb-2"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text content here..."
        rows={4}
        className="w-full px-3 py-2 border rounded-lg mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Upload Text'}
      </button>
    </div>
  );
}