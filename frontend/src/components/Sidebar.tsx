import React, { useState } from 'react';
import { Upload, File, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';

const Sidebar: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [assistantCreated, setAssistantCreated] = useState(false);
  const [creatingAssistant, setCreatingAssistant] = useState(false);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  const handleCreateAssistant = async () => {
    setCreatingAssistant(true);
    try {
      const response = await axios.post('http://localhost:5000/api/createAssistant');
      if (response.data.success) {
        setAssistantCreated(true);
      }
    } catch (error) {
      console.error('Error creating assistant:', error);
      alert('Failed to create assistant. Please try again.');
    } finally {
      setCreatingAssistant(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/createVectorStoreAndAddDocuments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setRecentFiles(prev => [file.name, ...prev]);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  if (!assistantCreated) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border">
        <div className="p-6 flex flex-col items-center justify-center h-full">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Embedit</h2>
            <p className="text-sm text-gray-500">
              Create an AI assistant to help you analyze your documents
            </p>
          </div>
          <button
            onClick={handleCreateAssistant}
            disabled={creatingAssistant}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {creatingAssistant ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Assistant...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Assistant
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Upload Documents</h2>
        <p className="text-sm text-gray-500 mt-1">Support for PDF, TXT, DOCX, or JSON</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex flex-col items-center justify-center w-full">
          <label 
            htmlFor="dropzone-file" 
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.docx,.json" />
          </label>
        </div>
        {file && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center">
            <File className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600 truncate">{file.name}</span>
          </div>
        )}
        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          disabled={!file || uploading}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </div>
          ) : (
            'Upload File'
          )}
        </button>
      </form>

      <div className="mt-auto p-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Files</h3>
        {recentFiles.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No files uploaded yet
          </p>
        ) : (
          <ul className="space-y-2">
            {recentFiles.map((fileName, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <File className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{fileName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

