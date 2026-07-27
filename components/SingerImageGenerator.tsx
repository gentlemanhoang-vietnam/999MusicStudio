import React, { useState, useCallback } from 'react';
import GlowingButton from './GlowingButton';
import LoadingSpinner from './LoadingSpinner';
import { generateSingerImage } from '../services/geminiService';
import type { GeneratedImageData } from '../types';

interface SingerImageGeneratorProps {
  onImageGenerated: (data: GeneratedImageData) => void;
}

type AspectRatio = '16:9' | '9:16' | '1:1';

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-5 h-5 text-purple-300">{children}</div>
);

const GuitarIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg></IconWrapper>;
const PianoIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12.75 6 6m16.5 6.75L18 6M9 21V3h6v18H9Z" /></svg></IconWrapper>;
const DrumsIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" /></svg></IconWrapper>;
const MicIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 0v-1.5a6 6 0 00-12 0v1.5m12 0v-1.5a6 6 0 00-12 0v1.5" /></svg></IconWrapper>;
const RainIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0Z" /></svg></IconWrapper>;
const CafeIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg></IconWrapper>;
const BuildingIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6" /></svg></IconWrapper>;
const StudioIcon = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5m-9 1.5h9M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75Zm-1.5 6a3 3 0 013-3h12a3 3 0 013 3v.016c0 .87-.622 1.58 1.477 1.823a.75.75 0 01-.256 1.464C20.03 21.536 17.16 21 12 21s-8.03.536-9.22 1.303a.75.75 0 01-.257-1.464C3.622 19.596 3 18.886 3 18.016V18Z" /></svg></IconWrapper>;

const cropImageToAspectRatio = (
    imageSrc: string,
    targetAspectRatio: AspectRatio
  ): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
  
        const aspectValues = { '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1 / 1 };
        const targetRatio = aspectValues[targetAspectRatio];
        
        let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height;
        const originalRatio = img.width / img.height;
  
        if (originalRatio > targetRatio) {
          // Image is wider than target, crop the sides
          srcWidth = img.height * targetRatio;
          srcX = (img.width - srcWidth) / 2;
        } else if (originalRatio < targetRatio) {
          // Image is taller than target, crop the top/bottom
          srcHeight = img.width / targetRatio;
          srcY = (img.height - srcHeight) / 2;
        }
  
        canvas.width = srcWidth;
        canvas.height = srcHeight;
        
        ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);
        
        const mimeType = imageSrc.substring(imageSrc.indexOf(":")+1,imageSrc.indexOf(";"));
        const dataUrl = canvas.toDataURL(mimeType);
        resolve({ base64: dataUrl.split(',')[1], mimeType: mimeType });
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  };

const SingerImageGenerator: React.FC<SingerImageGeneratorProps> = ({ onImageGenerated }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scene, setScene] = useState('đang đánh đàn guitar');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedImages, setGeneratedImages] = useState<{ image: string; prompt: string; }[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);

  const scenes = [
    { id: 'guitar', label: 'Chơi Guitar', value: 'đang đánh đàn guitar', icon: <GuitarIcon /> },
    { id: 'piano', label: 'Chơi Piano', value: 'đang đánh đàn piano', icon: <PianoIcon /> },
    { id: 'drums', label: 'Chơi Trống', value: 'đang đánh trống', icon: <DrumsIcon /> },
    { id: 'choir', label: 'Hát chính', value: 'đang đứng hát', icon: <MicIcon /> },
    { id: 'rain', label: 'Đứng trong mưa', value: 'đang đứng hát dưới mưa theo phong cách MV tâm trạng', icon: <RainIcon /> },
    { id: 'cafe', label: 'Bên cửa sổ cafe', value: 'đang ngồi hát bên khung cửa kính quán cafe có những giọt mưa', icon: <CafeIcon /> },
    { id: 'rooftop', label: 'Trên nóc nhà', value: 'đang đứng hát trên nóc một tòa nhà cao tầng nhìn xuống thành phố về đêm', icon: <BuildingIcon /> },
    { id: 'studio', label: 'Phòng thu', value: 'đang hát trong một studio phòng thu hiện đại, chuyên nghiệp', icon: <StudioIcon /> }
  ];

  const aspectRatios: { id: AspectRatio, label: string }[] = [
    { id: '16:9', label: '16:9' },
    { id: '9:16', label: '9:16' },
    { id: '1:1', label: '1:1' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if(selectedFile.size > 4 * 1024 * 1024) {
        setError("Kích thước tệp không được vượt quá 4MB.");
        return;
      }
      setFile(selectedFile);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Vui lòng tải lên một bức ảnh rõ mặt.');
      return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedImages(null);

    try {
        const originalDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const { base64, mimeType } = await cropImageToAspectRatio(originalDataUrl, aspectRatio);

        const results = await generateSingerImage(base64, mimeType, scene, aspectRatio);
        setGeneratedImages(results.map(r => ({ ...r, image: `data:image/jpeg;base64,${r.image}` })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVideo = (imageData: string) => {
    if (imageData) {
      const base64Data = imageData.split(',')[1];
      onImageGenerated({ base64: base64Data, mimeType: 'image/jpeg' });
    }
  };
  
  const handleDownload = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `nghe_sy_${index + 1}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCopyPrompt = (promptText: string, index: number) => {
      navigator.clipboard.writeText(promptText);
      setCopiedPrompt(index);
      setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const renderImageCard = (result: { image: string; prompt: string; }, originalIndex: number) => {
    return (
        <div key={originalIndex} className="flex flex-col gap-3 p-2 bg-black/20 rounded-lg">
            <img src={result.image} alt={`Generated singer ${originalIndex + 1}`} className="w-full rounded-md shadow-lg" />
            <div className="bg-gray-900/50 p-2 rounded-md text-xs">
                <label htmlFor={`prompt-${originalIndex}`} className="block text-gray-400 mb-1 font-semibold">Prompt đã dùng:</label>
                <textarea
                    id={`prompt-${originalIndex}`}
                    readOnly
                    className="w-full bg-transparent border-none resize-none h-20 p-0 text-gray-300 focus:ring-0"
                    value={result.prompt}
                />
                 <button 
                    onClick={() => handleCopyPrompt(result.prompt, originalIndex)} 
                    className="w-full mt-1 px-3 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-md text-xs font-semibold transition-colors"
                >
                    {copiedPrompt === originalIndex ? 'Đã sao chép!' : 'Sao chép Prompt'}
                </button>
            </div>
            <div className="flex gap-2 mt-auto">
                <button onClick={() => handleDownload(result.image, originalIndex)} className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg text-sm font-semibold transition-colors">Tải ảnh</button>
                <button onClick={() => handleCreateVideo(result.image)} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform">Tạo Video</button>
            </div>
        </div>
    );
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Inputs */}
        <div className="flex flex-col gap-6 md:col-span-1">
            <div>
                <label htmlFor="face-upload" className="block text-sm font-medium text-gray-300 mb-2">Tải ảnh của bạn</label>
                <div className="w-full h-64 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex justify-center items-center text-gray-400 p-2">
                    {preview ? (
                    <img src={preview} alt="Uploaded preview" className="max-h-full max-w-full object-contain rounded-lg" />
                    ) : "Xem trước ảnh"}
                </div>
                <input id="face-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="mt-2 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chọn bối cảnh</label>
                <div className="grid grid-cols-2 gap-2">
                    {scenes.map(({id, label, value, icon}) => (
                    <button key={id} onClick={() => setScene(value)} className={`p-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${scene === value ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {icon}
                        <span>{label}</span>
                    </button>
                    ))}
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chọn tỷ lệ ảnh</label>
                <div className="grid grid-cols-3 gap-2">
                    {aspectRatios.map(({id, label}) => (
                    <button key={id} onClick={() => setAspectRatio(id)} className={`py-2 rounded-lg text-sm font-semibold transition-colors ${aspectRatio === id ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {label}
                    </button>
                    ))}
                </div>
            </div>
            <div className="text-center">
                <GlowingButton onClick={handleSubmit} disabled={isLoading || !file}>
                {isLoading ? 'Đang tạo nghệ sỹ...' : 'Tạo ảnh'}
                </GlowingButton>
                {error && <p className="text-red-400 text-center mt-2">{error}</p>}
            </div>
        </div>

        {/* Right Column: Results */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 min-h-[400px] flex flex-col justify-center items-center md:col-span-2">
            {isLoading ? (
                <LoadingSpinner />
            ) : generatedImages ? (
                <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-4 p-1 overflow-y-auto">
                    {generatedImages.map((result, index) => renderImageCard(result, index))}
                </div>
            ) : (
                <p className="text-gray-500 text-center">Hình ảnh nghệ sĩ được tạo sẽ xuất hiện ở đây.</p>
            )}
        </div>
    </div>
  );
};

export default SingerImageGenerator;