
import React from 'react';

const AwardsSection: React.FC = () => {
  const logos = [
    { name: 'YD', text: 'YD' },
    { name: 'AsiaOne', text: 'AsiaOne' },
    { name: 'WGN9', text: 'WGN9' },
    { name: 'Macworld', text: 'Macworld' },
    { name: 'TechHive', text: 'TechHive' },
    { name: 'Yahoo', text: 'Yahoo!' },
    { name: 'AP', text: 'AP' },
  ];

  return (
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="container mx-auto px-6 text-center">
        <h4 className="text-xl font-medium text-blue-600 mb-12">奖项与认可</h4>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
          {logos.map((logo, i) => (
            <div key={i} className="text-2xl font-bold text-black tracking-tighter">
              {logo.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AwardsSection;
