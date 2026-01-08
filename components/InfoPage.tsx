
import React from 'react';
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
      text: "溯洄 (UPCORE) 成立于2021年，是一家专注于高端个人护理与智能家居的高科技公司。我们的目标是将极致的工业设计与前沿的生物科技相结合，提升每一个家庭的生活品质。"
    },
    support: {
      title: "服务支持",
      subtitle: "始终如一的守护。",
      text: "我们为您提供两年的官方质保服务。如果您在使用过程中遇到任何问题，可以通过官网防伪查询、软件下载中心或查看我们的售后政策来获得帮助。"
    },
    contact: {
      title: "联系我们",
      subtitle: "倾听您的声音。",
      text: "合作咨询：partner@upcore.tech\n售后服务：400-123-4567\n地址：中国广东省深圳市南山区溯洄科技园"
    }
  }[type];

  return (
    <div className="min-h-screen bg-white pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black">
          <ArrowLeft size={18} /> 返回
        </button>
        <div className="space-y-6">
          <h1 className="text-6xl font-black tracking-tighter">{content.title}</h1>
          <p className="text-2xl text-blue-600 font-bold">{content.subtitle}</p>
          <div className="h-2 w-20 bg-black rounded-full"></div>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed whitespace-pre-line font-light">
          {content.text}
        </p>
      </div>
    </div>
  );
};

export default InfoPage;
