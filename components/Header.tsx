import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          999 Music Studio
        </span>
      </h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
        Đối tác sáng tạo cho lời bài hát, hình ảnh nghệ sĩ và video âm nhạc.
      </p>
    </header>
  );
};

export default Header;