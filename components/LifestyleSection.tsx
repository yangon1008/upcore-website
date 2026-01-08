
import React from 'react';

const LifestyleSection: React.FC = () => {
  return (
    <section className="w-full bg-white py-20">
      <div className="container mx-auto px-6">
        <div className="rounded-[40px] overflow-hidden shadow-2xl">
          <img 
            src="https://picsum.photos/seed/usage/1920/1080" 
            alt="Lifestyle Usage" 
            className="w-full h-[600px] md:h-[800px] object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
