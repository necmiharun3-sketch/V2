import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LegalPage({ title, content }: { title: string, content: string }) {
  return (
    <div className="min-h-screen bg-[#000000] font-sans text-gray-300">
      <Header />
      
      <main className="pt-32 pb-24 px-4 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-12 uppercase border-l-4 border-[#ffcc00] pl-6">
            {title}
          </h1>
          
          <div className="bg-[#191919] border border-white/5 p-10 rounded-[30px] shadow-2xl leading-relaxed space-y-6">
             {/* Content lines */}
             {content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-gray-400 font-medium whitespace-pre-wrap">
                   {paragraph}
                </p>
             ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
