
import React from 'react';
import { ArrowLeft, CheckCircle2, ShoppingCart } from 'lucide-react';

interface DetailPageProps {
  onBack: () => void;
}

const DetailPage: React.FC<DetailPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            返回首页
          </button>
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold tracking-tighter">UPCORE <span className="font-light text-gray-400">DETAIL</span></span>
            <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform">
              <ShoppingCart size={16} /> 立即购买
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Gallery Mock */}
            <div className="space-y-6">
              <div className="aspect-square bg-gray-50 rounded-[48px] flex items-center justify-center overflow-hidden border border-gray-100">
                <img src="https://picsum.photos/seed/detail-main/800/800" alt="Main View" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
                    <img src={`https://picsum.photos/seed/detail-${i}/400/400`} alt={`Detail ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase rounded-full">
                  Featured Product
                </div>
                <h1 className="text-6xl font-extrabold tracking-tighter leading-none">
                  扫振 i2 <br/>大师款套装
                </h1>
                <p className="text-xl text-gray-500 leading-relaxed font-light">
                  融合现代美学与顶尖洁齿科技。航空级钛合金机身，配合自研高频扫振马达，为您带来前所未有的口腔护理体验。
                </p>
                <div className="text-4xl font-bold tracking-tight">
                  ¥ 1,299 <span className="text-lg font-normal text-gray-400 line-through ml-4">¥ 1,599</span>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4">
                  产品核心亮点
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    "60° 黄金摆幅技术",
                    "航空级金属机身",
                    "IPX8 级深度防水",
                    "90天超长续航",
                    "智能压力感应",
                    "5款定制专业刷头"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                      <CheckCircle2 className="text-blue-500" size={20} />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button className="w-full bg-black text-white py-5 rounded-3xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-2xl">
                  确认购买并支付
                </button>
                <button className="w-full bg-gray-50 text-black py-5 rounded-3xl font-bold text-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  加入愿望清单
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Mock */}
      <footer className="bg-gray-50 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-[0.2em]">Designed by Upcore in Shenzhen</p>
          <div className="w-12 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>
      </footer>
    </div>
  );
};

export default DetailPage;
