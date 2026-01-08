
import React from 'react';
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-10">
            <h2 className="text-3xl font-bold text-white tracking-tighter">UPCORE <span className="font-light opacity-50">溯洄</span></h2>
            <div className="space-y-4 max-w-sm">
              <p className="text-lg text-white font-medium">创新，只为更好的你。</p>
              <p className="text-sm leading-relaxed">溯洄成立于2021年，致力于通过科技创新重新定义个人护理与家庭生活方式。每一个产品都是对美学与功能的极致追求。</p>
            </div>
            <div className="flex space-x-6 text-white">
              <button onClick={() => onNavigate('home')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer">WX</button>
              <button onClick={() => onNavigate('home')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer">WB</button>
              <button onClick={() => onNavigate('home')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer">RD</button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-12">
            {columns.map((col, i) => (
              <div key={i} className="space-y-8">
                <h3 className="text-white text-sm font-bold tracking-widest uppercase">{col.title}</h3>
                <ul className="space-y-4 text-[13px] font-medium">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      {/* Updated button handler to support the new onNavigate signature */}
                      <button onClick={() => handleLinkClick(link)} className="hover:text-white transition-colors block text-left w-full">{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-semibold tracking-wide uppercase opacity-40">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <p>© 2025 UPCORE TECHNOLOGY</p>
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">隐私政策</button>
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">法律声明</button>
            <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">粤ICP备12345678号</button>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => onNavigate('home')}>CHINA (CN)</button>
            <div className="h-4 w-[1px] bg-white/20"></div>
            <button onClick={() => onNavigate('home')}>ENGLISH</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
