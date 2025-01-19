import React from 'react';
import { BookOpen } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <BookOpen className="w-8 h-8 text-blue-600" />
      <span className="text-2xl font-bold">
        Embed<span className="text-blue-600">it</span>
      </span>
    </div>
  );
};

export default Logo;

