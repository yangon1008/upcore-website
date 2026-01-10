
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface InfoPageProps {
  type: 'about' | 'support' | 'contact';
  onBack: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ type, onBack }) => {
  const content = {
    about: {
      title: "关于溯洄",
      subtitle: "科技，回归本真。",
      text: "溯洄 (UPCORE) 成立于2021年，是一家专注于高端个人护理与智能家居的高科技公司。我们的目标是将极致的工业设计与前沿的生物科技相结合，提升每一个家庭的生活品质。",
      icon: "🏢"
    },
    support: {
      title: "服务支持",
      subtitle: "始终如一的守护。",
      text: "我们为您提供两年的官方质保服务。如果您在使用过程中遇到任何问题，可以通过官网防伪查询、软件下载中心或查看我们的售后政策来获得帮助。",
      icon: "🛡️"
    },
    contact: {
      title: "联系我们",
      subtitle: "倾听您的声音。",
      text: "合作咨询：partner@upcore.tech\n售后服务：400-123-4567\n地址：中国广东省深圳市南山区溯洄科技园",
      icon: "📞"
    }
  }[type];

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
      className="min-h-screen bg-white pt-40 pb-20 px-6 transition-all duration-300 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 动态背景光晕效果 */}
      <div className={`
        absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]
        transition-transform duration-1500 ease-out
        ${isHovered ? 'scale-110' : 'scale-100'}
      `}></div>
      <div className={`
        absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]
        transition-transform duration-1500 ease-out
        ${isHovered ? 'scale-110' : 'scale-100'}
      `}></div>
      
      {/* 动态背景渐变 - 悬停时显示 */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5
        opacity-0 transition-opacity duration-1000
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `}></div>

      <div className="max-w-4xl mx-auto space-y-16 relative z-10">
        {/* 返回按钮 - 玻璃拟态效果 */}
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-all duration-300 group bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 shadow-sm"
        >
          <ArrowLeft 
            size={18} 
            className="group-hover:-translate-x-1 transition-transform duration-300" 
          />
          返回首页
        </button>
        
        {/* 内容区域 */}
        <div className="space-y-12">
          {/* 标题部分 - 渐变文字 */}
          <div className="space-y-8">
            {/* 图标 - 悬浮动画 */}
            <div className={`
              inline-block text-6xl transition-all duration-700 ease-out
              hover:scale-110 hover:rotate-5
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}
            `}>
              {content.icon}
            </div>
            
            {/* 主标题 - 渐变文字 + 滚动动画 */}
            <h1 className={`
              text-6xl md:text-7xl font-black tracking-tighter
              bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent
              animate-gradient-text
              transition-all duration-700 ease-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
            `}>
              {content.title}
            </h1>
            
            {/* 副标题 - 渐变文字 + 滚动动画 */}
            <p className={`
              text-2xl md:text-3xl font-bold
              bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
              animate-gradient-text
              transition-all duration-700 ease-out delay-200
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
            `}>
              {content.subtitle}
            </p>
            
            {/* 装饰性分割线 - 渐变 + 滚动动画 */}
            <div className={`
              h-1 w-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full
              transition-all duration-700 ease-out delay-400
              ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
            `}></div>
          </div>
          
          {/* 文本内容 - 玻璃拟态卡片 */}
          <div className={`
            bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-white/30 shadow-xl
            hover:shadow-2xl transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}
            transition-delay: 600ms
          `}>
            <p className="
              text-xl md:text-2xl text-gray-600 leading-relaxed whitespace-pre-line font-light
              transition-all duration-500 ease-out hover:text-gray-700
              bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 bg-clip-text text-transparent
            ">
              {content.text}
            </p>
            
            {/* 装饰性边框 - 悬停时显示 */}
            <div className="
              absolute inset-0 rounded-3xl border-2 border-white/30 pointer-events-none
              opacity-0 hover:opacity-100 transition-opacity duration-500
            "></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
