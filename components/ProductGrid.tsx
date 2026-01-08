
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ViewType } from '../App';

interface ProductGridProps {
  onNavigate: (view: ViewType) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onNavigate }) => {
  const products = [
    {
      name: "扫振 SE",
      desc: "为你开启专业口腔护理的第一支牙刷",
      img: "https://picsum.photos/seed/se-pro/800/800",
      color: "bg-[#F5F5F7]"
    },
    {
      name: "Swift 4",
      badge: "旗舰版",
      desc: "高速负离子，沙龙级护发体验",
      img: "https://picsum.photos/seed/swift-4/800/800",
      color: "bg-[#FAFAFA]"
    }
  ];

  return (
    <section className="bg-white py-32">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {products.map((p, i) => (
            <div key={i} className={`flex flex-col justify-between rounded-[48px] ${p.color} overflow-hidden group hover:shadow-2xl transition-all duration-700`}>
              <div className="p-16 space-y-6 text-center">
                <div className="space-y-2">
                  <h2 className="text-5xl font-bold tracking-tight flex items-center justify-center gap-4">
                    <span>{p.name}</span>
                    {p.badge && <span className="text-[10px] border border-black/10 px-3 py-1 rounded-full uppercase text-black/40 font-bold tracking-widest">{p.badge}</span>}
                  </h2>
                  <p className="text-gray-500 text-lg font-medium">{p.desc}</p>
                </div>
                
                <div className="flex items-center justify-center space-x-6 pt-4">
                  {/* Updated button actions to pass specific ViewType to onNavigate */}
                  <button onClick={() => onNavigate('shop')} className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-all flex items-center gap-2">
                    立即购买 <ArrowRight size={16} />
                  </button>
                  <button onClick={() => onNavigate('detail')} className="text-black font-bold text-sm hover:underline underline-offset-8 transition-all">
                    进一步了解
                  </button>
                </div>
              </div>
              
              <div className="relative px-12 pb-12 flex justify-center">
                <img 
                  src={p.img} 
                  alt={p.name} 
                  className="w-full max-w-[500px] h-auto object-contain transition-transform duration-1000 group-hover:scale-110 group-hover:-translate-y-4" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
