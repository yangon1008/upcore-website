
import React, { useEffect, useRef, useState } from 'react';

const AwardsSection: React.FC = () => {
  const logos = [
    { name: 'YD', text: 'YD' },
    { name: 'AsiaOne', text: 'AsiaOne' },
    { name: 'WGN9', text: 'WGN9' },
    { name: 'Macworld', text: 'Macworld' },
    { name: 'TechHive', text: 'TechHive' },
    { name: 'Yahoo', text: 'Yahoo!' },
    // { name: 'AP', text: 'AP' },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 滚动触发动画
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
      { threshold: 0.3 }
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

  return (
    <div 
      ref={sectionRef}
      className="py-20"
    >
      <div className="container mx-auto px-6 text-center">
        {/* 标题 - 渐变文字 + 滚动触发 */}
        <h4 className={`
          text-xl font-medium text-blue-600 mb-12
          bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
          animate-gradient-text
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
          transition-all duration-700 ease-out
        `}>
          奖项与认可
        </h4>
        
        {/* 奖项 Logo 网格 */}
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {logos.map((logo, i) => (
            <div 
              key={i}
              className={`
                text-2xl md:text-3xl font-bold text-black tracking-tighter
                transition-all duration-500 ease-out
                hover:opacity-100 hover:scale-110 hover:text-blue-600
                cursor-pointer group
                ${isVisible ? 'opacity-60 translate-y-0' : 'opacity-0 translate-y-20'}
              `}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className="relative z-10">{logo.text}</span>
              {/* 背景发光效果 */}
              <span className="
                absolute inset-0 -m-2 bg-gradient-to-r from-blue-500 to-purple-500 
                opacity-0 group-hover:opacity-20 transition-opacity duration-500
                rounded-full blur-xl
              "></span>
              {/* 点击波纹 */}
              <span className="
                absolute inset-0 -m-4 rounded-full bg-blue-500/30 scale-0 
                group-active:scale-100 transition-transform duration-500
                pointer-events-none
              "></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AwardsSection;
