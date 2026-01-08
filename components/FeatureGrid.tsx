
import React from 'react';
import { ViewType } from '../App';

interface FeatureGridProps {
  onNavigate: (view: ViewType) => void;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ onNavigate }) => {
  const features = [
    { title: "自动开门烘干", desc: "极致能效，更干更净", img: "https://picsum.photos/seed/dish-1/600/600", span: "md:col-span-1 md:row-span-1", bg: "bg-white" },
    { title: "全球首创", desc: "扫动式喷淋技术", img: "https://picsum.photos/seed/dish-2/1200/800", span: "md:col-span-2 md:row-span-2", bg: "bg-[#F5F5F7]", isLarge: true },
    { title: "纤薄机身设计", desc: "仅 28cm 厚度", img: "https://picsum.photos/seed/dish-3/600/600", span: "md:col-span-1 md:row-span-1", bg: "bg-white" },
    { title: "AI 智慧洗", desc: "自动匹配程序", img: "https://picsum.photos/seed/dish-4/600/600", span: "md:col-span-1 md:row-span-1", bg: "bg-white" },
    { title: "极速洗烘", desc: "15分钟高效净洗", img: "https://picsum.photos/seed/dish-5/600/600", span: "md:col-span-1 md:row-span-1", bg: "bg-blue-600", dark: true, overlay: "15 MIN" },
    { title: "节省 70% 水资源", desc: "环保生活", img: "https://picsum.photos/seed/dish-6/800/400", span: "md:col-span-2 md:row-span-1", bg: "bg-white", horizontal: true },
    { title: "多重杀菌防护", desc: "UVC + 等离子", img: "https://picsum.photos/seed/dish-7/800/400", span: "md:col-span-2 md:row-span-1", bg: "bg-[#111111]", dark: true, horizontal: true }
  ];

  return (
    <section className="bg-[#FBFBFB] py-32 px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-20 space-y-4">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">极简。更是不凡。</h2>
          <p className="text-xl text-gray-400 max-w-2xl font-light">LISSOME R1 台面式洗碗机，为现代厨房而生。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((f, i) => (
            <div key={i} onClick={() => onNavigate('detail')} className={`${f.span} ${f.bg} rounded-[48px] p-8 md:p-10 flex flex-col justify-between overflow-hidden relative group transition-all duration-700 hover:shadow-2xl border border-black/5 cursor-pointer`}>
              <div className="relative z-10 space-y-2">
                <h3 className={`text-2xl font-bold tracking-tight ${f.dark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
                <p className={`text-sm font-medium opacity-50 ${f.dark ? 'text-white/80' : 'text-gray-500'}`}>{f.desc}</p>
              </div>
              <div className={`relative z-0 flex items-center justify-center transition-transform duration-1000 group-hover:scale-105 ${f.isLarge ? 'h-full py-6' : 'mt-8'}`}>
                <img src={f.img} alt={f.title} className="w-full object-contain max-h-[240px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
