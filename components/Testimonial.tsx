
import React, { useEffect, useRef, useState } from 'react';

const Testimonial: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div 
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 动态背景渐变 - 悬停时显示 */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5
        opacity-0 transition-opacity duration-1000
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `}></div>
      
      {/* 背景光晕效果 */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] transition-transform duration-1500 ease-out hover:scale-110"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] transition-transform duration-1500 ease-out hover:scale-110"></div>
      
      <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
        {/* 标题 - 渐变文字 + 滚动触发 */}
        <h4 className={`
          text-xl font-medium mb-10
          bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
          animate-gradient-text
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
          transition-all duration-700 ease-out
        `}>
          赞同者
        </h4>
        
        {/* 引用符号 - 动态效果 */}
        <div className={`
          text-6xl text-gray-300 mb-8
          transition-all duration-500 ease-out
          ${isVisible ? 'opacity-80 scale-100' : 'opacity-0 scale-50'}
          ${isHovered ? 'text-blue-400 scale-110' : 'text-gray-300 scale-100'}
        `}>“</div>
        
        {/* 引用文字 - 渐变文字 + 滚动触发 */}
        <p className={`
          text-2xl md:text-3xl font-bold leading-relaxed mb-10
          bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent
          animate-gradient-text
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
          transition-all duration-700 ease-out delay-200
          ${isHovered ? 'scale-105' : 'scale-100'}
        `}>
          推出最紧凑、最智能的便携式洗碗机 LISSOME R1：彻底改变小空间的清洁方式
        </p>
        
        {/* 装饰性分割线 - 滚动触发 */}
        <div className={`
          h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto
          ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
          transition-all duration-700 ease-out delay-400
        `}></div>
      </div>
    </div>
  );
};

export default Testimonial;
