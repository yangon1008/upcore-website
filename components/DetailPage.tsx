
import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface DetailPageProps {
  onBack: () => void;
  productName: string;
}

const DetailPage: React.FC<DetailPageProps> = ({ onBack, productName }) => {
  const [isBuying, setIsBuying] = useState(false);

  const handleBuy = () => {
    setIsBuying(true);
    // 添加购买按钮动画效果
    setTimeout(() => {
      // 跳转到指定外部网站
      window.open('https://mall.jd.com/index-1000104683.html?from=pc&spmTag=YTAyMTkuYjAwMjM1Ni5jMDAwMDQ2ODkuMiUyM2hpc2tleXdvcmQlMkNhMDI0MC5iMDAyNDkzLmMwMDAwNDAyNy4xJTIzZW50ZXJfc2hvcA', '_blank');
      setIsBuying(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-all duration-300 font-medium group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
            返回首页
          </button>
          <button 
            onClick={handleBuy}
            disabled={isBuying}
            className={`bg-black text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:bg-gray-800 ${
              isBuying ? 'opacity-70 cursor-not-allowed scale-95' : ''
            }`}
          >
            <ShoppingCart size={16} className={isBuying ? 'animate-pulse' : ''} />
            <span>{isBuying ? '处理中...' : '立即购买'}</span>
          </button>
        </div>
      </nav>
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-6">
            <div className="aspect-square bg-gray-50 rounded-[48px] overflow-hidden border border-gray-100 group hover:shadow-xl transition-all duration-500">
              <img 
                src="https://picsum.photos/seed/detail-main/800/800" 
                alt={productName} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl font-extrabold tracking-tighter transition-opacity duration-500">{productName} <br/>大师款套装</h1>
              <p className="text-xl text-gray-500 font-light transition-opacity duration-500 delay-100">融合现代美学与顶尖洁齿科技。航空级钛合金机身。</p>
              <div className="text-4xl font-bold transition-opacity duration-500 delay-200">¥ 1,299</div>
            </div>
            <button 
              onClick={handleBuy}
              disabled={isBuying}
              className={`w-full bg-black text-white py-5 rounded-3xl font-bold text-lg transition-all duration-500 hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-1 ${
                isBuying ? 'opacity-70 cursor-not-allowed scale-95' : ''
              }`}
            >
              {isBuying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>处理中...</span>
                </div>
              ) : (
                '立即购买'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailPage;
