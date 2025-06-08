import React from 'react';

interface TruncatedTextProps {
  text: string | null;
  maxWidth?: string;
  className?: string;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({ 
  text, 
  maxWidth = '200px',
  className = ''
}) => {
  return (
    <div 
      className={`max-w-[${maxWidth}] truncate hover:whitespace-normal hover:overflow-visible hover:z-10 hover:bg-white hover:shadow-lg hover:absolute hover:p-2 hover:rounded ${className}`}
      title={text || ''}
    >
      {text || '-'}
    </div>
  );
}; 