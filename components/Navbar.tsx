
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { ViewType } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  onNavigate: (view: ViewType) => void;
  initialBg?: 'dark' | 'light';
  currentView?: ViewType;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, initialBg = 'light', currentView = 'home' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const isChinese = language === 'zh';

  // 滚动监听 - 增强的过渡效果
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 处理导航点击
  const handleNavigate = (view: ViewType) => {
    setIsMenuOpen(false);
    onNavigate(view);
  };

  // 导航菜单数据 - 支持中英文切换
  const getNavItems = () => {
    return [
      { label: t('nav.home'), view: 'home' as ViewType },
      { label: t('nav.support'), view: 'support' as ViewType },
      { label: t('nav.about'), view: 'about' as ViewType }
    ];
  };
  
  // 获取当前语言的导航项
  const navItems = getNavItems();

  return (
    <nav 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out 
        px-4 sm:px-6 md:px-12 py-3 sm:py-4 md:py-6 backdrop-blur-3xl
        ${initialBg === 'dark' || isScrolled ? 
          'bg-black/80 border-b border-white/10 shadow-lg' : 
          'bg-transparent border-b-0 shadow-none'}
      `}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between relative">
        {/* 左侧 Logo - 图片形式 */}
        <div 
          className="flex items-center cursor-pointer group"
          onClick={() => handleNavigate('home')}
        >
          <img
            src="/images/logo.png"
            alt="Upcore 溯洄"
            className="
              h-8 sm:h-10 w-auto transition-all duration-300 group-hover:scale-105
              object-contain
            "
            style={{ mixBlendMode: 'lighten' }}
          />
          {/* 点击波纹效果 */}
          <div className="absolute inset-0 -m-4 rounded-full bg-white/10 scale-0 group-active:scale-100 transition-transform duration-500 pointer-events-none"></div>
        </div>

        {/* 桌面端导航菜单 - 玻璃拟态效果 */}
        <div className="hidden lg:flex items-center space-x-6 sm:space-x-10 text-white/70 text-[13px] font-medium tracking-wide uppercase">
          {navItems.map((item, index) => (
            <button 
              key={index}
              onClick={() => handleNavigate(item.view)}
              className={`
                relative px-3 py-2 transition-all duration-300
                group
                ${currentView === item.view ? 'text-white' : 'hover:text-white'}
              `}
            >
              {item.label}
              {/* 下划线动画 */}
              <span className={`
                absolute bottom-0 left-0 h-0.5 bg-white
                transition-all duration-500 ease-out
                ${currentView === item.view ? 'w-full' : 'w-0 group-hover:w-full'}
              `}></span>
              {/* 悬停光晕效果 */}
              <span className="
                absolute inset-0 -m-2 rounded-full bg-white/10 opacity-0
                group-hover:opacity-100 transition-opacity duration-300
                pointer-events-none
              "></span>
            </button>
          ))}
        </div>

        {/* 右侧功能按钮 */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-white">
          {/* 语言切换按钮 */}
          <button 
            onClick={toggleLanguage}
            className="
              px-3 py-1 sm:px-4 sm:py-2 rounded-full hover:bg-white/10 transition-all duration-300
              group flex items-center justify-center
              lg:flex
            "
            aria-label="切换语言"
          >
            <span className="text-sm sm:text-base font-medium">
              {isChinese ? 'EN' : '中文'}
            </span>
            <span className="
              absolute inset-0 -m-1 rounded-full bg-white/10 opacity-0
              group-hover:opacity-100 transition-opacity duration-300
              pointer-events-none
            "></span>
          </button>
          
          {/* 搜索按钮 - 悬停动画 */}
        <button 
          onClick={() => handleNavigate('support')}
          className="
            p-2 sm:p-3 rounded-full hover:bg-white/10 transition-all duration-300
            group
            lg:flex items-center justify-center
          "
          aria-label="搜索"
        >
            <Search 
              size={18} sm:size={20} 
              strokeWidth={2} 
              className="group-hover:scale-110 transition-transform duration-300"
            />
          </button>
          
          {/* 商城按钮 - 渐变背景 + 悬停效果 */}
          <button 
            onClick={() => window.open('https://mall.jd.com/index-1000104683.html?from=pc&spmTag=YTAyMTkuYjAwMjM1Ni5jMDAwMDQ2ODkuMiUyM2hpc2tleXdvcmQlMkNhMDI0MC5iMDAyNDkzLmMwMDAwNDAyNy4xJTIzZW50ZXJfc2hvcA', '_blank')}
            className="
              bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-white
              px-4 sm:px-7 py-2 sm:py-3 rounded-full text-[11px] sm:text-[13px] font-bold flex items-center space-x-1 sm:space-x-2
              transition-all duration-300 shadow-xl hover:shadow-2xl
              hover:scale-105 active:scale-95 group
            "
          >
            <ShoppingCart 
              size={14} sm:size={16} 
              fill="currentColor" 
              className="group-hover:rotate-12 transition-transform duration-300"
            />
            <span className="hidden sm:inline">{t('nav.shop')}</span>
            {/* 按钮发光效果 */}
            <span className="
              absolute inset-0 rounded-full bg-white/30 blur-sm opacity-0
              group-hover:opacity-100 transition-opacity duration-300
              pointer-events-none
            "></span>
          </button>
          
          {/* 移动端汉堡菜单按钮 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="
              lg:hidden p-2 sm:p-3 rounded-full hover:bg-white/10 transition-all duration-300
              group flex items-center justify-center
            "
            aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {isMenuOpen ? (
              <X 
                size={20} 
                strokeWidth={2} 
                className="group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <Menu 
                size={20} 
                strokeWidth={2} 
                className="group-hover:scale-110 transition-transform duration-300"
              />
            )}
          </button>
        </div>

        {/* 移动端导航菜单 */}
        <div className={`
          lg:hidden absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-3xl
          border-b border-white/10 shadow-xl transition-all duration-500 ease-out
          overflow-hidden
          ${isMenuOpen ? 'opacity-100 translate-y-0 height-auto' : 'opacity-0 translate-y-[-10px] height-0 pointer-events-none'}
        `}>
          <div className="px-6 py-4 space-y-1">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigate(item.view)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg transition-all duration-300
                  ${currentView === item.view 
                    ? 'text-white bg-white/10' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'}
                  text-base font-medium tracking-wide
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
