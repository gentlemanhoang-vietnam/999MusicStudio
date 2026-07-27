import React, { useState, useEffect, useCallback } from 'react';
import GlowingButton from './GlowingButton';
import LoadingSpinner from './LoadingSpinner';
import { generateSingerVideo } from '../services/geminiService';
import type { GeneratedImageData } from '../types';

interface SingerVideoGeneratorProps {
  sourceImage: GeneratedImageData | null;
}

const SingerVideoGenerator: React.FC<SingerVideoGeneratorProps> = ({ sourceImage }) => {
  const [image, setImage] = useState<GeneratedImageData | null>(sourceImage);
  const [preview, setPreview] = useState<string | null>(null);
  const [animation, setAnimation] = useState('hát cảm xúc buồn - nhạc chậm');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const animations = [
    { id: 'sad', label: 'Buồn - Chậm', value: 'hát cảm xúc buồn - nhạc chậm' },
    { id: 'chorus', label: 'Điệp khúc cao trào', value: 'hát điệp khúc cao trào' },
    { id: 'intro', label: 'Phiêu nhạc Intro', value: 'không hát, chỉ nhắm mắt phiêu theo điệu nhạc intro' },
    { id: 'moody', label: 'Tâm trạng', value: 'biểu diễn đầy tâm trạng, tập trung vào biểu cảm khuôn mặt' },
    { id: 'flycam', label: 'Flycam', value: 'với góc máy flycam lướt nhẹ từ xa đến gần' },
    { id: '360', label: 'Quay 360°', value: 'với camera quay chậm 360 độ xung quanh ca sĩ' }
  ];

  useEffect(() => {
    if (sourceImage) {
      setImage(sourceImage);
      setPreview(`data:${sourceImage.mimeType};base64,${sourceImage.base64}`);
    }
  }, [sourceImage]);

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
          setError("Kích thước tệp không được vượt quá 4MB.");
          return;
      }
      setError('');
      setPreview(URL.createObjectURL(file));
      const base64 = await fileToBase64(file);
      setImage({ base64, mimeType: file.type });
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Vui lòng cung cấp một hình ảnh để tạo chuyển động.');
      return;
    }
    setError('');
    setIsLoading(true);
    setVideoUrl(null);
    setGeneratedPrompt(null);
    setLoadingMessage('Bắt đầu tạo video...');

    try {
      const result = await generateSingerVideo(image.base64, image.mimeType, animation, setLoadingMessage);
      setVideoUrl(result.videoUrl);
      setGeneratedPrompt(result.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleCopyPrompt = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
        <div className="flex flex-col gap-6">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Ảnh để tạo chuyển động</label>
                <div className="w-full h-64 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex justify-center items-center text-gray-400 p-2">
                    {preview ? (
                    <img src={preview} alt="Image to animate" className="max-h-full max-w-full object-contain rounded-lg" />
                    ) : "Tải lên hoặc dùng ảnh đã tạo"}
                </div>
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="mt-2 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"/>
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Chọn kiểu chuyển động</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {animations.map(({id, label, value}) => (
                    <button key={id} onClick={() => setAnimation(value)} className={`p-3 rounded-lg text-sm font-semibold transition-colors text-center ${animation === value ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {label}
                    </button>
                    ))}
                </div>
            </div>
            <div className="text-center mt-auto pt-4">
                <GlowingButton onClick={handleSubmit} disabled={isLoading || !image}>
                {isLoading ? 'Đang sản xuất...' : 'Tạo Video'}
                </GlowingButton>
            </div>
            {error && <p className="text-red-400 text-center mt-2">{error}</p>}
        </div>

        {/* Right Column: Results */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 min-h-[400px] flex flex-col justify-center items-center gap-4">
            {isLoading ? (
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-300">{loadingMessage}</p>
                </div>
            ) : videoUrl ? (
                <div className="flex flex-col gap-4 w-full h-full items-center">
                    <video src={videoUrl} controls autoPlay loop className="max-h-64 md:max-h-80 w-auto rounded-lg shadow-lg" />
                    {generatedPrompt && (
                        <div className="w-full max-w-sm bg-gray-900/50 p-2 rounded-md text-xs mt-2">
                            <label htmlFor="video-prompt" className="block text-gray-400 mb-1 font-semibold">Prompt đã dùng:</label>
                            <textarea
                                id="video-prompt"
                                readOnly
                                className="w-full bg-transparent border-none resize-none h-16 p-0 text-gray-300 focus:ring-0"
                                value={generatedPrompt}
                            />
                            <button 
                                onClick={handleCopyPrompt} 
                                className="w-full mt-1 px-3 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-md text-xs font-semibold transition-colors"
                            >
                                {isCopied ? 'Đã sao chép!' : 'Sao chép Prompt'}
                            </button>
                        </div>
                    )}
                     <a 
                        href={videoUrl} 
                        download="ai_music_video.mp4"
                        className="mt-auto w-full max-w-sm text-center px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                        Tải Video
                    </a>
                </div>
            ) : (
                <p className="text-gray-500 text-center">Video được tạo của bạn sẽ xuất hiện ở đây.</p>
            )}
        </div>
    </div>
  );
};

export default SingerVideoGenerator;