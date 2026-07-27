import React, { useState, useEffect } from 'react';
import GlowingButton from './GlowingButton';
import LoadingSpinner from './LoadingSpinner';
import { generateLyrics, suggestStyle } from '../services/geminiService';

const PRO_KEY = "SUNO-X8K2-L9P5-Q1M7";
const MAX_FREE_USES = 2;

const LyricGenerator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [suggestedStyle, setSuggestedStyle] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);

  // PRO Feature State
  const [isPro, setIsPro] = useState(false);
  const [freeUses, setFreeUses] = useState(MAX_FREE_USES);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [proKeyInput, setProKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');

  useEffect(() => {
    const proStatus = localStorage.getItem('isPro') === 'true';
    setIsPro(proStatus);

    if (!proStatus) {
      const usesLeft = localStorage.getItem('freeUses');
      if (usesLeft !== null) {
        setFreeUses(parseInt(usesLeft, 10));
      } else {
        localStorage.setItem('freeUses', String(MAX_FREE_USES));
      }
    }
  }, []);


  const specialMusicStyles = ['[ Blue Rock Say ]', '[ Blue Rock Tích Cực ]', '[ Ballad Buồn ]', '[ Bolero buồn ]', '[ Báo Hiếu Cha Mẹ ]'];
  const regularMusicStyles = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Folk', 'Jazz', 'Bolero', 'Blue', 'Blue Rock', 'Nhạc chậm', 'Ballad', 'Acoustic', 'Lofi', 'EDM', 'Nhạc Trữ Tình'];
  
  const styleColors = [
    { bg: 'bg-blue-600', hover: 'hover:bg-blue-500', ring: 'ring-blue-400' },
    { bg: 'bg-green-600', hover: 'hover:bg-green-500', ring: 'ring-green-400' },
    { bg: 'bg-red-600', hover: 'hover:bg-red-500', ring: 'ring-red-400' },
    { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-400', ring: 'ring-yellow-300', text: 'text-black' },
    { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-500', ring: 'ring-indigo-400' },
    { bg: 'bg-pink-600', hover: 'hover:bg-pink-500', ring: 'ring-pink-400' },
    { bg: 'bg-teal-600', hover: 'hover:bg-teal-500', ring: 'ring-teal-400' },
    { bg: 'bg-orange-500', hover: 'hover:bg-orange-400', ring: 'ring-orange-300' },
  ];


  const handleStyleToggle = (style: string) => {
    const isSpecial = specialMusicStyles.includes(style);
    if (isSpecial && !isPro && freeUses <= 0) {
        setShowUpgradePopup(true);
        return;
    }

    setSelectedStyles(prevStyles => {
        const isSelected = prevStyles.includes(style);
        if (isSelected) {
            return prevStyles.filter(s => s !== style);
        } else {
            if (prevStyles.length < 5) {
                return [...prevStyles, style];
            }
            return prevStyles; 
        }
    });
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Vui lòng nhập mô tả cho bài hát của bạn.');
      return;
    }
    if (selectedStyles.length === 0) {
        setError('Vui lòng chọn ít nhất một phong cách âm nhạc.');
        return;
    }

    const usingSpecialStyle = selectedStyles.some(s => specialMusicStyles.includes(s));
    if (usingSpecialStyle && !isPro && freeUses <= 0) {
        setShowUpgradePopup(true);
        return;
    }

    setError('');
    setIsLoading(true);
    setLyrics('');
    setGeneratedTitle('');
    setSuggestedStyle('');
    setRefinementPrompt('');

    try {
      const result = await generateLyrics(description, selectedStyles.join(', '));
      setGeneratedTitle(result.title);
      setLyrics(result.lyrics);
      
      if (result.stylePrompt) {
        setSuggestedStyle(result.stylePrompt);
      } else {
        const styleSuggestion = await suggestStyle(result.lyrics);
        setSuggestedStyle(styleSuggestion);
      }
      
      if (usingSpecialStyle && !isPro) {
        const newFreeUses = freeUses - 1;
        setFreeUses(newFreeUses);
        localStorage.setItem('freeUses', String(newFreeUses));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefine = async () => {
    if (!refinementPrompt.trim() || !lyrics) {
        setError('Vui lòng nhập yêu cầu chỉnh sửa.');
        return;
    }
    setError('');
    setIsRefining(true);

    try {
        const result = await generateLyrics(description, selectedStyles.join(', '), { title: generatedTitle, existingLyrics: lyrics, prompt: refinementPrompt });
        setLyrics(result.lyrics);
        setRefinementPrompt('');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
        setIsRefining(false);
    }
  };

  const handleCopy = () => {
    if (!lyrics) return;
    navigator.clipboard.writeText(lyrics);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyPrompt = () => {
    if (!suggestedStyle) return;
    navigator.clipboard.writeText(suggestedStyle);
    setIsPromptCopied(true);
    setTimeout(() => setIsPromptCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!lyrics) return;
    const fullText = `${generatedTitle}\n\n${lyrics}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedTitle.replace(/ /g, '_') || 'LoiBaiHat'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleValidateKey = () => {
    if (proKeyInput.trim() === PRO_KEY) {
        setIsPro(true);
        localStorage.setItem('isPro', 'true');
        setShowUpgradePopup(false);
        setKeyError('');
        setProKeyInput('');
    } else {
        setKeyError('Mã PRO không hợp lệ. Vui lòng thử lại.');
    }
  };
  
  const isAdvancedLocked = !isPro && freeUses <= 0;

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Inputs */}
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Mô tả bài hát</label>
          <textarea
              id="description"
              rows={4}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="ví dụ: Một bài hát về hành trình dài trở về nhà dưới những vì sao"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Advanced Composition Box */}
          <div className="relative">
            {isAdvancedLocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg z-10 flex flex-col justify-center items-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400 mb-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-white font-bold text-center">Tính năng PRO</p>
                    <button onClick={() => setShowUpgradePopup(true)} className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
                        Nâng cấp ngay
                    </button>
                </div>
            )}
            <div className="bg-purple-900/20 border border-purple-600/50 rounded-lg p-4 transition-shadow hover:shadow-lg hover:shadow-purple-600/20">
              <h4 className="text-base font-bold text-purple-300">Sáng Tác Nâng Cao {isPro ? <span className="text-xs font-bold text-yellow-400 ml-1">(PRO)</span> : <span className="text-xs font-normal text-gray-400 ml-1">({freeUses > 0 ? `${freeUses} lần dùng thử` : 'Hết lượt dùng thử'})</span>}</h4>
              <p className="text-xs text-gray-400 mb-2">Các phong cách này tuân thủ 3 nguyên tắc sáng tạo chuyên sâu:</p>
              <ul className="text-xs text-gray-400 list-none mb-3 space-y-1 pl-2">
                  <li><span className="font-bold text-purple-400">A. Nguyên Tắc Sáng Tác Lời:</span> Đảm bảo chiều sâu và cảm xúc.</li>
                  <li><span className="font-bold text-purple-400">B. Cấu Trúc Lời Chuyên Nghiệp:</span> Tuân thủ cấu trúc chuẩn cho từng thể loại.</li>
                  <li><span className="font-bold text-purple-400">C. Gợi Ý Âm Nhạc (Prompt):</span> Tích hợp sẵn công thức prompt cho Suno AI.</li>
              </ul>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phong Cách Đặc Biệt Từ Thầy Long</label>
              <div className="flex flex-wrap gap-2">
                  {specialMusicStyles.map((style) => {
                      const color = styleColors[3]; // Yellow
                      const isSelected = selectedStyles.includes(style);
                      return (
                          <button
                              key={style}
                              onClick={() => handleStyleToggle(style)}
                              disabled={(selectedStyles.length >= 5 && !isSelected)}
                              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                                  isSelected
                                      ? `${color.bg} ${color.hover} ${color.text} ring-2 ${color.ring}`
                                      : `bg-yellow-900/50 text-yellow-300 hover:bg-yellow-800/60`
                              } disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed`}
                          >
                              {style}
                          </button>
                      );
                  })}
              </div>
            </div>
          </div>


          {/* Regular Styles Section */}
          <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hoặc chọn phong cách thông thường</label>
              <div className="flex flex-wrap gap-2">
                  {regularMusicStyles.map((style, index) => {
                      const color = styleColors[index % styleColors.length];
                      const isSelected = selectedStyles.includes(style);
                      return (
                          <button
                              key={style}
                              onClick={() => handleStyleToggle(style)}
                              disabled={selectedStyles.length >= 5 && !isSelected}
                              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                                  isSelected
                                      ? `${color.bg} ${color.hover} text-white ring-2 ${color.ring}`
                                      : `bg-gray-700 text-white hover:bg-gray-600`
                              } disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed`}
                          >
                              {style}
                          </button>
                      )
                  })}
              </div>
          </div>
          <p className="text-xs text-gray-500">{selectedStyles.length} / 5 đã chọn</p>
        </div>


        <div className="flex flex-col items-center gap-4 mt-auto pt-6">
            <GlowingButton onClick={handleSubmit} disabled={isLoading || isRefining}>
            {isLoading ? 'Đang tạo...' : 'Tạo lời bài hát'}
            </GlowingButton>
        </div>
        {error && <p className="text-red-400 text-center mt-2">{error}</p>}
      </div>

      {/* Right Column: Results */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 md:h-[580px] flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-gray-200">Kết quả</h3>
        {isLoading ? (
            <div className="m-auto">
                <LoadingSpinner />
            </div>
        ) : lyrics ? (
          <div className="flex flex-col flex-grow min-h-0">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xl font-bold text-purple-300">{generatedTitle}</h4>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy} 
                  className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                  title="Sao chép lời bài hát"
                >
                  {isCopied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
                <button 
                  onClick={handleDownload}
                  className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                  title="Tải về file .txt"
                >
                  Tải về
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 bg-black/20 p-3 rounded-md">
                <pre className="whitespace-pre-wrap text-gray-200 font-sans">{lyrics}</pre>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-4">
                {suggestedStyle && !isRefining && (
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-semibold text-purple-300">Gợi ý phong cách (Prompt cho Suno):</p>
                          <button
                            onClick={handleCopyPrompt}
                            className="px-3 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-md text-xs font-semibold transition-colors"
                            title="Sao chép gợi ý phong cách"
                          >
                            {isPromptCopied ? 'Đã sao chép!' : 'Sao chép'}
                          </button>
                        </div>
                        <p className="text-gray-200 text-xs whitespace-pre-wrap">{suggestedStyle}</p>
                    </div>
                )}
                <div>
                    <label htmlFor="refinement" className="block text-sm font-medium text-gray-300 mb-2">Chỉnh sửa & Hoàn thiện</label>
                    <textarea
                        id="refinement"
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                        placeholder="ví dụ: Viết lại đoạn điệp khúc cho mạnh mẽ hơn, thêm một đoạn guitar solo..."
                        value={refinementPrompt}
                        onChange={(e) => setRefinementPrompt(e.target.value)}
                        disabled={isLoading || isRefining}
                    />
                </div>
                <div className="text-center">
                    <GlowingButton onClick={handleRefine} disabled={isLoading || isRefining || !refinementPrompt.trim()}>
                        {isRefining ? 'Đang hoàn thiện...' : 'Hoàn thiện bài hát'}
                    </GlowingButton>
                </div>
            </div>

          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500 text-center">Lời bài hát được tạo sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </div>
    </div>
    
    {/* Upgrade Popup */}
    {showUpgradePopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 border border-purple-600/50 rounded-2xl shadow-2xl shadow-purple-500/20 max-w-md w-full p-8 text-center relative">
                <button 
                    onClick={() => setShowUpgradePopup(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">Nâng cấp tài khoản PRO</h3>
                <p className="text-gray-300 mb-4">
                    Vui lòng nâng cấp PRO để sử dụng tính năng sáng tác nhạc chất lượng cao không giới hạn.
                </p>
                <div className="text-left bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-gray-300"><span className="font-semibold text-purple-300">Liên hệ hỗ trợ:</span> 0888649819</p>
                    <p className="text-gray-300"><span className="font-semibold text-purple-300">Phí nâng cấp:</span> 50.000 VNĐ</p>
                </div>
                <div className="mt-6">
                    <label htmlFor="pro-key" className="block text-sm font-medium text-gray-300 mb-2">Nhập mã PRO của bạn</label>
                    <input 
                        type="text"
                        id="pro-key"
                        value={proKeyInput}
                        onChange={(e) => setProKeyInput(e.target.value)}
                        placeholder="ví dụ: SUNO-XXXX-XXXX-XXXX"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-center focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                    {keyError && <p className="text-red-400 text-xs mt-2">{keyError}</p>}
                </div>
                <div className="mt-6">
                    <GlowingButton onClick={handleValidateKey}>
                        Xác nhận
                    </GlowingButton>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default LyricGenerator;