import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, ChevronRight, ChevronLeft, Send, Sparkles, ShoppingBag, Maximize2, RotateCcw } from 'lucide-react';
import { INTERIOR_STYLES, generateRoomMakeover, refineDesign } from './services/geminiService';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(INTERIOR_STYLES[0]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setGeneratedImage(null);
        setChatHistory([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleSelect = async (style: typeof INTERIOR_STYLES[0]) => {
    if (!originalImage) return;
    setCurrentStyle(style);
    setIsGenerating(true);
    const result = await generateRoomMakeover(originalImage, style.prompt);
    if (result) {
      setGeneratedImage(result);
      setSliderPosition(50);
    }
    setIsGenerating(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !originalImage) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    const { text, imageUrl } = await refineDesign(
      generatedImage || originalImage, 
      userMsg, 
      chatHistory
    );

    if (imageUrl) {
      setGeneratedImage(imageUrl);
    }

    setChatHistory(prev => [...prev, { role: 'model', text }]);
    setIsChatLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-[#FF4D3B]/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF4D3B] rounded-lg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AURA</h1>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-1.5 py-0.5 rounded ml-2">AI Interior</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setOriginalImage(null);
              setGeneratedImage(null);
              setChatHistory([]);
            }}
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visualization */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-[4/3] bg-white rounded-3xl border-4 border-black shadow-2xl overflow-hidden group">
            {!originalImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">Upload a photo of your room</p>
                <p className="text-sm text-gray-400 mt-1 text-center max-w-xs px-4">
                  Take a clear photo of your space to start the AI makeover
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            ) : (
              <div className="relative w-full h-full select-none">
                {/* Original Image */}
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Generated Image with Slider */}
                {generatedImage && (
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Slider Handle */}
                {generatedImage && (
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-black/10">
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-gray-300 rounded-full" />
                        <div className="w-0.5 h-3 bg-gray-300 rounded-full" />
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sliderPosition} 
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                    />
                  </div>
                )}

                {/* Labels */}
                {generatedImage && (
                  <>
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Original</div>
                    <div className="absolute bottom-4 right-4 bg-[#FF4D3B]/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Reimagined</div>
                  </>
                )}

                {/* Loading Overlay */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                    >
                      <div className="w-12 h-12 border-4 border-[#FF4D3B] border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="font-bold text-lg tracking-tight">Reimagining your space...</p>
                      <p className="text-sm text-gray-500">Applying {currentStyle.name} aesthetics</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Style Carousel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Select Style</h3>
              <div className="flex gap-2">
                <button className="p-1 rounded-full hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 rounded-full hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {INTERIOR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style)}
                  disabled={!originalImage || isGenerating}
                  className={cn(
                    "flex-shrink-0 px-6 py-3 rounded-2xl border-2 transition-all text-sm font-bold whitespace-nowrap",
                    currentStyle.id === style.id 
                      ? "bg-black text-white border-black" 
                      : "bg-white text-gray-500 border-gray-100 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-4 flex flex-col h-[calc(100vh-120px)] bg-white rounded-3xl border border-black/5 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-black/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Design Consultant</h2>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-bold">Start a conversation</p>
                  <p className="text-xs text-gray-400 mt-1">Ask for refinements or where to buy items from the design.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full">
                  {["Make the rug blue", "Add more plants", "Where can I find this sofa?"].map((suggestion) => (
                    <button 
                      key={suggestion}
                      onClick={() => setInputMessage(suggestion)}
                      className="text-[11px] font-bold text-left px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-black/5"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl p-3 text-sm",
                    msg.role === 'user' 
                      ? "ml-auto bg-black text-white rounded-tr-none" 
                      : "mr-auto bg-gray-100 text-gray-800 rounded-tl-none"
                  )}
                >
                  <div className="prose prose-sm prose-invert max-w-none">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </motion.div>
              ))
            )}
            {isChatLoading && (
              <div className="flex gap-1 p-2">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-gray-50 border-t border-black/5">
            <div className="relative">
              <input
                type="text"
                placeholder={originalImage ? "Refine your design..." : "Upload a photo first"}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!originalImage || isChatLoading}
                className="w-full bg-white border border-black/10 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D3B]/20 focus:border-[#FF4D3B] transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !originalImage || isChatLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center hover:bg-[#FF4D3B] transition-colors disabled:opacity-50 disabled:hover:bg-black"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Powered by Gemini 3 Pro & 2.5 Flash Image
            </p>
          </div>
        </div>
      </main>

      {/* Footer / Info */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <Sparkles className="text-white w-3.5 h-3.5" />
            </div>
            <h4 className="font-bold text-sm tracking-tight">AURA AI</h4>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Our advanced neural networks analyze your space's geometry and lighting to provide physically accurate interior design transformations.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Capabilities</h4>
          <ul className="text-xs text-gray-600 space-y-2">
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FF4D3B] rounded-full" /> Style Transfer</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FF4D3B] rounded-full" /> Object Refinement</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FF4D3B] rounded-full" /> Contextual Shopping</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Security</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your photos are processed securely and are not stored permanently. We prioritize your privacy and data sovereignty.
          </p>
        </div>
      </footer>
    </div>
  );
}
