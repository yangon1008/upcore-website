
import React, { useEffect, useRef, useState } from 'react';
import { ViewType } from '../App';

interface FooterProps {
  onNavigate: (view: ViewType) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const columns = [
    {
      title: "热门产品",
      links: ["扫振 i2 系列", "扫振 SE 系列", "Swift 4 电吹风", "LISSOME 洗碗机"]
    },
    {
      title: "官方渠道",
      links: ["溯洄商城", "天猫旗舰店", "京东旗舰店"]
    },
    {
      title: "服务支持",
      links: ["售后政策", "防伪查询", "帮助中心", "软件下载", "联系我们"]
    },
    {
      title: "关于溯洄",
      links: ["品牌故事", "加入我们", "全球业务", "可持续发展"]
    }
  ];

  const footerRef = useRef<HTMLDivElement>(null);
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
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  // Logic to map footer link strings to their corresponding application views
  const handleLinkClick = (link: string) => {
    if (link === '联系我们') onNavigate('contact');
    else if (link === '品牌故事' || link === '关于溯洄') onNavigate('about');
    else if (link === '服务支持' || link === '帮助中心' || link === '售后政策') onNavigate('support');
    else if (link === '溯洄商城') onNavigate('shop');
    else if (link === '扫振 i2 系列' || link === '扫振 SE 系列' || link === 'Swift 4 电吹风' || link === 'LISSOME 洗碗机') onNavigate('detail');
    else onNavigate('home');
  };

  return (
    <footer className="bg-[#050505] text-[#888888] pt-32 pb-16">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div 
          ref={footerRef}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 transition-all duration-1000 ease-out`}
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(50px)' }}
        >
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center justify-center lg:justify-start">
              <img
                src="/images/logo.png"
                alt="Upcore 溯洄"
                className="
                  h-12 w-auto transition-all duration-300 hover:scale-105
                  object-contain
                "
                style={{ mixBlendMode: 'lighten' }}
              />
            </div>
            <div className="space-y-4 max-w-sm">
              <p className="text-lg text-white font-medium transition-all duration-300 hover:text-gray-200">
                创新，只为更好的你。
              </p>
              <p className="text-sm leading-relaxed transition-all duration-300 hover:text-gray-500">
                溯洄成立于2021年，致力于通过科技创新重新定义个人护理与家庭生活方式。每一个产品都是对美学与功能的极致追求。
              </p>
            </div>
            
            {/* 社交媒体图标 - 悬停动画 */}
            <div className="flex space-x-6 text-white">
              {['WX', 'WB', 'RD'].map((social, i) => (
                <button 
                  key={i}
                  onClick={() => onNavigate('home')}
                  className="
                    w-10 h-10 rounded-full border border-white/10 
                    flex items-center justify-center cursor-pointer
                    transition-all duration-500 ease-out
                    hover:bg-white/20 hover:scale-125 hover:rotate-12
                    group relative overflow-hidden
                  "
                >
                  <span className="relative z-10">{social}</span>
                  {/* 背景发光效果 */}
                  <span className="
                    absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 
                    opacity-0 group-hover:opacity-30 transition-opacity duration-500
                  "></span>
                  {/* 点击波纹 */}
                  <span className="
                    absolute inset-0 -m-2 rounded-full bg-white/20 scale-0 
                    group-active:scale-100 transition-transform duration-500
                    pointer-events-none
                  "></span>
                </button>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-12">
            {columns.map((col, i) => (
              <div 
                key={i}
                className={`space-y-8 transition-all duration-700 ease-out`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* 标题 - 悬停效果 */}
                <h3 className="
                  text-white text-sm font-bold tracking-widest uppercase
                  transition-all duration-300 hover:text-gray-300 hover:scale-105
                ">
                  {col.title}
                </h3>
                
                {/* 链接列表 */}
                <ul className="space-y-4 text-[13px] font-medium">
                  {col.links.map((link, j) => (
                    <li 
                      key={j}
                      className="transition-all duration-300 hover:translate-x-2"
                    >
                      <button 
                        onClick={() => handleLinkClick(link)}
                        className="
                          block text-left w-full transition-all duration-300 
                          hover:text-white relative overflow-hidden
                          group
                        "
                      >
                        <span className="relative z-10">{link}</span>
                        {/* 下划线动画 */}
                        <span className="
                          absolute bottom-0 left-0 w-0 h-0.5 bg-white
                          group-hover:w-full transition-all duration-500 ease-out
                        "></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="
          pt-12 border-t border-white/5 
          flex flex-col md:flex-row justify-between items-center gap-8 
          text-[11px] font-semibold tracking-wide uppercase opacity-40
          transition-all duration-700 ease-out
          hover:opacity-60
        ">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <p>© 2025 UPCORE TECHNOLOGY</p>
            {['隐私政策', '法律声明', '粤ICP备12345678号'].map((item, i) => (
              <button 
                key={i}
                onClick={() => onNavigate('home')}
                className="
                  hover:text-white transition-all duration-300 
                  relative
                  group
                "
              >
                <span>{item}</span>
                <span className="
                  absolute bottom-0 left-0 w-0 h-0.5 bg-white
                  group-hover:w-full transition-all duration-300
                "></span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-6">
            {['CHINA (CN)', 'ENGLISH'].map((lang, i) => (
              <React.Fragment key={i}>
                <button 
                  onClick={() => onNavigate('home')}
                  className="
                    hover:text-white transition-all duration-300
                    group
                  "
                >
                  <span>{lang}</span>
                  <span className="
                    absolute bottom-0 left-0 w-0 h-0.5 bg-white
                    group-hover:w-full transition-all duration-300
                  "></span>
                </button>
                {i < 1 && <div className="h-4 w-[1px] bg-white/20"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
