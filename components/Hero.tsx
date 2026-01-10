
import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewType } from '../App';

interface HeroProps {
  onNavigate: (view: ViewType) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef1 = useRef<HTMLDivElement>(null);
  const bgRef2 = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  // 视差滚动效果
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !bgRef1.current || !bgRef2.current || !productRef.current) return;
      
      const scrollY = window.scrollY;
      const sectionHeight = sectionRef.current.offsetHeight;
      
      // 背景光晕视差效果（反向滚动）
      const parallaxSpeed1 = -scrollY * 0.15;
      const parallaxSpeed2 = -scrollY * 0.1;
      const productParallax = scrollY * 0.05;
      
      bgRef1.current.style.transform = `translateY(${parallaxSpeed1}px)`;
      bgRef2.current.style.transform = `translateY(${parallaxSpeed2}px)`;
      productRef.current.style.transform = `translateY(${productParallax}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen min-h-[900px] w-full bg-black flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        {/* 背景光晕 - 视差效果 */}
        <div 
          ref={bgRef1}
          className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-900/20 rounded-full blur-[180px] transition-transform duration-300 ease-out"
        ></div>
        <div 
          ref={bgRef2}
          className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[150px] transition-transform duration-300 ease-out"
        ></div>
        
        {/* 渐变叠加层 - 动态变化 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black animate-gradient-shift"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-0">
        <div className="lg:col-span-5 text-white space-y-10 order-2 lg:order-1 pt-12 lg:pt-0">
          <div className="space-y-6">
            {/* 动态渐变标签 */}
            <div className="inline-block px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase animate-pulse-slow">
              Flagship Release
            </div>
            
            {/* 渐变文字 - 动态色彩切换 */}
            <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-[0.9] animate-gradient-text">
              扫振 <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 transition-all duration-5000 ease-in-out">
                i2 系列
              </span>
            </h1>
            
            {/* 文字淡入动画 */}
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-lg leading-relaxed animate-fade-in">
              五种大师级机身材质，配合五款专研刷头。<br/>开启口腔护理的“扫振”时代。
            </p>
          </div>

          <div className="flex items-center space-x-6">
            {/* 交互按钮 - 悬停效果 */}
            <button 
              onClick={() => onNavigate('detail', '扫振 i2')} 
              className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all duration-500 shadow-xl hover:-translate-y-1 hover:shadow-2xl active:scale-95 relative overflow-hidden group"
            >
              <span className="relative z-10">进一步了解</span>
              <span className="absolute inset-0 bg-black/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </button>
            <button 
              onClick={() => window.open('https://mall.jd.com/index-1000104683.html?from=pc&spmTag=YTAyMTkuYjAwMjM1Ni5jMDAwMDQ2ODkuMiUyM2hpc2tleXdvcmQlMkNhMDI0MC5iMDAyNDkzLmMwMDAwNDAyNy4xJTIzZW50ZXJfc2hvcA', '_blank')} 
              className="border border-white/20 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/5 transition-all duration-500 backdrop-blur-sm hover:-translate-y-1 active:scale-95 group"
            >
              <span className="relative z-10">立即购买</span>
              <span className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 relative flex justify-center lg:justify-end items-center order-1 lg:order-2 h-full py-20 lg:py-0">
          <div 
            ref={productRef}
            className="relative group"
          >
            {/* 产品光晕 - 交互放大 */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl scale-75 group-hover:scale-100 transition-transform duration-1500 ease-out"></div>
            
            {/* 产品视频 - 悬浮效果 */}
            <video 
              src="/vedio/brushtooth.mp4" 
              alt="Upcore i2 Flagship" 
              className="relative h-[600px] md:h-[850px] object-contain drop-shadow-[0_40px_100px_rgba(0,0,0,0.5)] z-10 group-hover:scale-105 transition-transform duration-1000 ease-out"
              autoPlay
              loop
              muted
              playsInline
              poster="https://picsum.photos/seed/upcore-i2-gold/1000/1500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>
            
            {/* 技术规格卡片 - 悬停效果 */}
            <div 
              onClick={() => onNavigate('detail')} 
            >
            </div>
          </div>
        </div>
      </div>
      
      {/* 自定义动画样式 */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
        
        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default Hero;
