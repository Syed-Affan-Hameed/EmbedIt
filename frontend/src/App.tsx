import React from 'react';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex space-x-6">
            <button className="text-gray-600 hover:text-gray-900">Documents</button>
            <button className="text-gray-600 hover:text-gray-900">History</button>
            <button className="text-gray-600 hover:text-gray-900">Settings</button>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto px-4 py-6">
        <div className="flex gap-6 w-full h-full">
          <aside className="w-80 flex-shrink-0 hidden md:block">
            <Sidebar />
          </aside>
          <section className="flex-1 min-w-0">
            <ChatInterface />
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;

