
import React, { useState, useCallback } from 'react';
import { ActiveTab, GeneratedImageData } from './types';
import LyricGenerator from './components/LyricGenerator';
import SingerImageGenerator from './components/SingerImageGenerator';
import SingerVideoGenerator from './components/SingerVideoGenerator';
import Header from './components/Header';
import TabButton from './components/TabButton';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Lyrics);
  const [generatedImageData, setGeneratedImageData] = useState<GeneratedImageData | null>(null);

  const handleImageGenerated = useCallback((data: GeneratedImageData) => {
    setGeneratedImageData(data);
    setActiveTab(ActiveTab.Video);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case ActiveTab.Lyrics:
        return <LyricGenerator />;
      case ActiveTab.Image:
        return <SingerImageGenerator onImageGenerated={handleImageGenerated} />;
      case ActiveTab.Video:
        return <SingerVideoGenerator sourceImage={generatedImageData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col p-4 md:p-8">
      <Header />
      <main className="flex-grow flex flex-col items-center w-full">
        <div className="w-full max-w-6xl bg-black bg-opacity-30 backdrop-blur-lg rounded-2xl shadow-2xl shadow-purple-500/10 border border-gray-700/50 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center p-2 bg-gray-900/50 border-b border-gray-700/50 gap-2">
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
              <TabButton
                label="1. Sáng tác lời"
                isActive={activeTab === ActiveTab.Lyrics}
                onClick={() => setActiveTab(ActiveTab.Lyrics)}
              />
              <TabButton
                label="2. Tạo nghệ sỹ"
                isActive={activeTab === ActiveTab.Image}
                onClick={() => setActiveTab(ActiveTab.Image)}
              />
              <TabButton
                label="3. Tạo Video"
                isActive={activeTab === ActiveTab.Video}
                onClick={() => setActiveTab(ActiveTab.Video)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <a 
                    href="https://999.edu.vn/?ref=6" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto text-center px-4 py-2.5 text-sm md:text-base font-semibold rounded-lg transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-[0_0_15px_rgba(236,72,153,0.7)]"
                >
                    NHẬN QUÀ 20 APP MIỄN PHÍ
                </a>
                <a 
                    href="https://suno.com/invite/@vothanhlong999" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto text-center px-4 py-2.5 text-sm md:text-base font-semibold rounded-lg transition-all duration-300 bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:scale-105 hover:shadow-[0_0_15px_rgba(52,211,153,0.7)]"
                >
                    SÁNG TÁC NHẠC NGAY
                </a>
            </div>
          </div>
          <div className="p-6 md:p-8">
            {renderContent()}
          </div>
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Cung cấp bởi Gemini. Dành cho nghệ sĩ hiện đại.</p>
      </footer>
    </div>
  );
};

export default App;
