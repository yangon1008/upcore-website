
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';

interface NavbarProps {
  onNavigate: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-6 md:px-12 ${isScrolled ? 'bg-black/70 backdrop-blur-xl py-4' : 'bg-transparent py-8'}`}>
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="text-2xl font-bold text-white tracking-tighter flex items-center gap-2">
            UPCORE <span className="font-light opacity-80">溯洄</span>
          </span>
        </div>

        {/* Links */}
        <div className="hidden lg:flex items-center space-x-12 text-white/70 text-[13px] font-medium tracking-wide uppercase">
          <button onClick={onNavigate} className="hover:text-white transition-colors">服务支持</button>
          <button onClick={onNavigate} className="hover:text-white transition-colors">联系我们</button>
          <button onClick={onNavigate} className="hover:text-white transition-colors">关于溯洄</button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-8 text-white">
          <button onClick={onNavigate} className="hover:text-white/70 transition-colors">
            <Search size={18} strokeWidth={2} />
          </button>
          <div onClick={onNavigate} className="hidden sm:flex items-center text-[12px] font-semibold tracking-wider hover:text-white/70 cursor-pointer transition-colors border border-white/20 px-3 py-1 rounded-full">
            CN
          </div>
          <button onClick={onNavigate} className="bg-white text-black hover:bg-white/90 px-6 py-2 rounded-full text-[13px] font-bold flex items-center space-x-2 transition-all shadow-lg hover:scale-105 active:scale-95">
            <ShoppingCart size={14} fill="currentColor" />
            <span>商城</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
