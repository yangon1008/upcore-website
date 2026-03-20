
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewType } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onNavigate: any;
}

interface SlideContent {
  title: string;
  subtitle: string;
  description: string;
  tag: string;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isScrolling, setIsScrolling] = useState(false);
  const { t } = useLanguage();

  // Product images
  const productImages = [
    "/images/products/toothbrush1.png",
    "/images/products/toothbrush2.png",
    "/images/products/toothbrush3.png"
  ];

  // Slide content corresponding to each image
  const slideContents: SlideContent[] = [
    {
      title: t('hero.title1'),
      subtitle: t('hero.subtitle1'),
      description: t('hero.description1'),
      tag: t('hero.flagship')
    },
    {
      title: t('hero.title2'),
      subtitle: t('hero.subtitle2'),
      description: t('hero.description2'),
      tag: t('hero.professional')
    },
    {
      title: t('hero.title3'),
      subtitle: t('hero.subtitle3'),
      description: t('hero.description3'),
      tag: t('hero.smart')
    },
    {
      title: t('hero.title4'),
      subtitle: t('hero.subtitle4'),
      description: t('hero.description4'),
      tag: t('hero.hair')
    }
  ];

  // 滚动事件处理 - 只在Hero和LifestyleSection之间实现阻滞效果
  useEffect(() => {
    // 更自然的缓动函数：easeOutQuad
    const easeOutQuad = (t: number) => {
      return t * (2 - t);
    };
    
    // 平滑滚动函数
    const smoothScrollTo = (targetPosition: number) => {
      const startPosition = window.scrollY;
      const duration = 800; // 更短的动画时间，提高响应性
      let startTime: number | null = null;
      
      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = easeOutQuad(progress);
        
        window.scrollTo(0, startPosition + (targetPosition - startPosition) * easeProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsScrolling(false);
        }
      };
      
      requestAnimationFrame(animate);
    };
    
    const handleScroll = (e: WheelEvent) => {
      if (!sectionRef.current || isScrolling) return;
      
      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const heroHeight = rect.height;
      
      // 向下滚动：当Hero底部进入视口15%时，平滑滚动到下一部分
      if (e.deltaY > 0 && rect.bottom < windowHeight * 1.15 && rect.bottom > 0) {
        e.preventDefault();
        setIsScrolling(true);
        
        // 计算目标位置：滚动到LifestyleSection顶部
        const targetPosition = scrollY + rect.bottom;
        smoothScrollTo(targetPosition);
      }
      
      // 向上滚动：当从LifestyleSection滚动回Hero时，平滑滚动到Hero顶部
      if (e.deltaY < 0 && scrollY > heroHeight - windowHeight * 0.15 && scrollY < heroHeight + windowHeight * 0.15) {
        e.preventDefault();
        setIsScrolling(true);
        
        // 计算目标位置：滚动到Hero顶部
        const targetPosition = heroHeight - windowHeight;
        smoothScrollTo(targetPosition);
      }
    };

    // 添加滚动事件监听
    window.addEventListener('wheel', handleScroll, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [isScrolling]);

  // Carousel navigation with transition
  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection('next');
    setCurrentSlide((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
    
    // Reset transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection('prev');
    setCurrentSlide((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
    
    // Reset transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const currentContent = slideContents[currentSlide];

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen min-h-[900px] w-full bg-black flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
          {/* 渐变叠加层 - 动态变化 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black animate-gradient-shift"></div>
        </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-0">
        {/* Left content with animation */}
        <div className={`lg:col-span-6 text-white space-y-10 order-2 lg:order-1 pt-12 lg:pt-0 transition-all duration-700 ease-out ${isTransitioning ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'}`} style={{ transitionDelay: '200ms' }}>
          <div className="space-y-6">
            {/* 动态渐变标签 */}
            <div className="inline-block px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase animate-pulse-slow">
              {currentContent.tag}
            </div>
            
            {/* 渐变文字 - 动态色彩切换 */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.2] animate-gradient-text overflow-visible">
              {currentContent.title}
              <span className="block mt-2 whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 transition-all duration-5000 ease-in-out pb-2">
                {currentContent.subtitle}
              </span>
            </h1>
            
            {/* 文字淡入动画 */}
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-lg leading-relaxed animate-fade-in" dangerouslySetInnerHTML={{ __html: currentContent.description }}>
            </p>
          </div>

          <div className="flex items-center space-x-6">
            {/* 交互按钮 - 悬停效果 */}
            <button 
              onClick={() => onNavigate('detail', currentContent.title === 'Swift' ? 'Swift 4' : '扫振 i2')} 
              className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all duration-500 shadow-xl hover:-translate-y-1 hover:shadow-2xl active:scale-95 relative overflow-hidden group"
            >
              <span className="relative z-10">{t('hero.learnMore')}</span>
              <span className="absolute inset-0 bg-black/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </button>
            <button 
              onClick={() => window.open('https://mall.jd.com/index-1000104683.html?from=pc&spmTag=YTAyMTkuYjAwMjM1Ni5jMDAwMDQ2ODkuMiUyM2hpc2tleXdvcmQlMkNhMDI0MC5iMDAyNDkzLmMwMDAwNDAyNy4xJTIzZW50ZXJfc2hvcA', '_blank')} 
              className="border border-white/20 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/5 transition-all duration-500 backdrop-blur-sm hover:-translate-y-1 active:scale-95 group"
            >
              <span className="relative z-10">{t('hero.buyNow')}</span>
              <span className="absolute inset-0 bg-white/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </button>
          </div>
        </div>

        {/* Right carousel with cool transition effects */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center order-1 lg:order-2 h-full py-20 lg:py-0">
          <div className="relative group w-full max-w-[600px]">
            
            {/* Carousel container */}
            <div className="relative overflow-hidden">
              {/* Main product image with cool transitions */}
              <img
                src={productImages[currentSlide]}
                alt={`${currentContent.title} ${currentContent.subtitle} 产品图片`}
                className={`
                  relative h-[600px] md:h-[850px] object-contain drop-shadow-[0_40px_100px_rgba(0,0,0,0.5)] z-10 transition-all duration-1000 ease-out 
                  ${isTransitioning ? 
                    direction === 'next' ? 
                      'scale-125 translate-x-[-20%] opacity-0 rotate-[-5deg]' : 
                      'scale-125 translate-x-[20%] opacity-0 rotate-[5deg]' 
                    : 
                    'group-hover:scale-105 scale-100 translate-x-0 opacity-100 rotate-0' 
                  }
                `}
              />
              
              {/* Next/Previous buttons */}
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Thumbnail preview */}
              {/* <div className={`absolute bottom-10 right-0 z-20 bg-white/10 backdrop-blur-md rounded-lg p-2 w-[200px] transition-all duration-700 ease-out ${isTransitioning ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`} style={{ transitionDelay: '500ms' }}>
                <img
                  src={productImages[(currentSlide + 1) % productImages.length]}
                  alt="Next product preview"
                  className="w-full h-auto object-contain rounded"
                />
              </div> */}
              
              {/* Dots indicator */}
              <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 transition-all duration-700 ease-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} style={{ transitionDelay: '600ms' }}>
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (isTransitioning) return;
                      setIsTransitioning(true);
                      setDirection(index > currentSlide ? 'next' : 'prev');
                      setCurrentSlide(index);
                      setTimeout(() => setIsTransitioning(false), 1000);
                    }}
                    disabled={isTransitioning}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>
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
        
        @keyframes slide-in-next {
          from { opacity: 0; transform: translateX(-50px) rotate(-5deg) scale(0.9); }
          to { opacity: 1; transform: translateX(0) rotate(0) scale(1); }
        }
        
        @keyframes slide-in-prev {
          from { opacity: 0; transform: translateX(50px) rotate(5deg) scale(0.9); }
          to { opacity: 1; transform: translateX(0) rotate(0) scale(1); }
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
        
        .animate-slide-in-next {
          animation: slide-in-next 1s ease-out forwards;
        }
        
        .animate-slide-in-prev {
          animation: slide-in-prev 1s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default Hero;
