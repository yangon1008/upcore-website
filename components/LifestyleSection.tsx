
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
      className="w-full bg-white py-20 overflow-hidden scroll-snap-align start scroll-snap-stop always"
    >
      <div className="container mx-auto px-6">
        <div 
          className="relative rounded-[40px] overflow-hidden shadow-2xl transition-all duration-700 group"
        >
          {/* 视频背景 - 类似AirPods 4设计 */}
          <div className="relative h-[600px] md:h-[800px] overflow-hidden">
            {/* 视频元素 */}
            <video 
              ref={imgRef}
              src="/vedio/home1.mp4" 
              alt="Lifestyle Video" 
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              style={{ 
                opacity: isVisible ? 1 : 0,
              }}
            />
            
          </div>
          
          {/* 装饰性边框 */}
          <div className="absolute inset-0 border-2 border-white/10 rounded-[40px] pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
