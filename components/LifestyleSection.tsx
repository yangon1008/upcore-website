
import React, { useEffect, useRef, useState } from 'react';

const LifestyleSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 滚动触发动画 - 使用 Intersection Observer API
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // 视差滚动效果
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !imgRef.current) return;
      
      const scrollY = window.scrollY;
      const sectionTop = sectionRef.current.offsetTop;
      const sectionHeight = sectionRef.current.offsetHeight;
      
      // 仅在元素进入视口时应用视差效果
      if (scrollY > sectionTop + sectionHeight || scrollY + window.innerHeight < sectionTop) {
        return;
      }
      
      // 计算视差速度（图片向上滚动，与页面滚动方向相反）
      const parallaxSpeed = (scrollY - sectionTop) * 0.4;
      imgRef.current.style.transform = `translateY(${parallaxSpeed}px) scale(${isVisible ? 1 : 0.95})`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-white py-20 overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <div 
          className="relative rounded-[40px] overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-3xl group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 视差图片 - 黑白平滑过渡效果 */}
          <div className="relative h-[600px] md:h-[800px] overflow-hidden">
            <img 
              ref={imgRef}
              src="https://picsum.photos/seed/usage/1920/1080" 
              alt="Lifestyle Usage" 
              className={`w-full h-full object-cover transition-all duration-1000 ease-out grayscale(${isHovered ? 0 : 100}) brightness(${isHovered ? 1 : 0.9})`}
              style={{ 
                opacity: isVisible ? 1 : 0,
                transform: `translateY(0) scale(${isVisible ? 1 : 0.95})`
              }}
            />
            
            {/* 玻璃拟态覆盖层 - 悬停时显示 */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end`}>
              <div className="p-10 backdrop-blur-sm bg-white/10 border-t border-white/20 w-full">
                <h2 className="text-4xl font-bold text-white mb-2">生活方式</h2>
                <p className="text-white/80 text-lg">体验科技与生活的完美融合</p>
              </div>
            </div>
            
            {/* 动态光晕效果 */}
            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] opacity-0 group-hover:opacity-50 transition-opacity duration-1000"></div>
          </div>
          
          {/* 装饰性边框 - 玻璃拟态效果 */}
          <div className="absolute inset-0 border-2 border-white/20 rounded-[40px] pointer-events-none backdrop-blur-sm"></div>
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
