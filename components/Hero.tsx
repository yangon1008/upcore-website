
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewType } from '../App';

interface HeroProps {
  onNavigate: (view: ViewType) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative h-screen min-h-[900px] w-full bg-black flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-900/20 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-0">
        <div className="lg:col-span-5 text-white space-y-10 order-2 lg:order-1 pt-12 lg:pt-0">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase">
              Flagship Release
            </div>
            <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-[0.9]">
              扫振 <br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">i2 系列</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-lg leading-relaxed">
              五种大师级机身材质，配合五款专研刷头。<br/>开启口腔护理的“扫振”时代。
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <button onClick={() => onNavigate('detail')} className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all shadow-xl hover:-translate-y-1">
              进一步了解
            </button>
            <button onClick={() => onNavigate('shop')} className="border border-white/20 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/5 transition-all backdrop-blur-sm">
              立即购买
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 relative flex justify-center lg:justify-end items-center order-1 lg:order-2 h-full py-20 lg:py-0">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
            <img 
              src="https://picsum.photos/seed/upcore-i2-gold/1000/1500" 
              alt="Upcore i2 Flagship" 
              className="relative h-[600px] md:h-[850px] object-contain drop-shadow-[0_40px_100px_rgba(0,0,0,0.5)] z-10"
            />
            <div onClick={() => onNavigate('detail')} className="absolute top-1/4 -right-12 bg-white/5 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-3xl hidden xl:block animate-bounce-slow cursor-pointer">
              <div className="space-y-4">
                <img src="https://picsum.photos/seed/head-detail/240/180" alt="Precision Head" className="rounded-2xl w-48 grayscale hover:grayscale-0 transition-all duration-500" />
                <div className="text-white">
                  <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Tech Spec</p>
                  <p className="text-sm font-medium">60° 黄金摆幅</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
