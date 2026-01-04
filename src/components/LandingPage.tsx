import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationFrame,
  wrap,
  useVelocity as useVelocityFramer
} from 'framer-motion';
import { ArrowRight, Zap, Shield, Wallet, Users, Twitter, FileText, Code, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';

// Custom hook to ensure velocity is available or polyfilled safely if needed
// But framer-motion exports it. We renamed it to avoid conflicts if we wrote a custom one.
const useVelocity = useVelocityFramer;

const carouselImages = [
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
];

const CarouselItem = ({ src, x }: { src: string, index: number, x: any, baseWidth: number }) => {
  return (
    <motion.div
      className="relative w-[180px] md:w-[260px] aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-xl border-[4px] border-white flex-shrink-0 cursor-pointer"
      style={{ x }}
      whileHover={{ scale: 1.05, y: -10, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <img
        src={src}
        alt="Highlight"
        className="w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

const Carousel = () => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  /**
   * This is a magic direction value that tells us which way to render the infinite translation.
   */
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * 5 * (delta / 1000);
    // Speed it up a bit
    moveBy *= 1;

    // Optional: Modify speed by scroll
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() - moveBy);
  });

  const infiniteList = [...carouselImages, ...carouselImages, ...carouselImages, ...carouselImages];

  return (
    <div className="w-full relative py-6 overflow-x-hidden flex perspective-container">
      <motion.div className="flex gap-6 md:gap-8 pl-8" style={{ x }}>
        {infiniteList.map((img, i) => (
          <CarouselItem
            key={i}
            src={img}
            index={i}
            x={0}
            baseWidth={300}
          />
        ))}
      </motion.div>

      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FFFBF5] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#FFFBF5] to-transparent z-10 pointer-events-none" />
    </div>
  );
};

const Navbar = ({ onLaunch }: { onLaunch: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full px-6 transition-all duration-300 ease-in-out ${isScrolled
        ? 'py-4 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-sm'
        : 'py-6 bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center shrink-0">
          <span className="text-xl font-bold tracking-tight text-gray-900">Arbifans</span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-700 absolute left-1/2 -translate-x-1/2">
          <a href="#" className="hover:text-gray-900 transition-colors">Brands</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Creators</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Pricing</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Use Cases</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={onLaunch}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all"
          >
            Launch App
          </button>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ onLaunch }: { onLaunch: () => void }) => {
  return (
    <section className="relative w-full h-screen max-h-[900px] flex flex-col justify-between overflow-x-hidden bg-gradient-to-b from-[#F3F4F6] to-white pt-24 md:pt-32">
      {/* Decorative Hand-Drawn Elements */}
      <div className="absolute top-24 left-10 md:left-24 text-[#12AAFF] opacity-10 transform -rotate-12 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10,50 Q50,10 90,50 T10,50" />
        </svg>
      </div>
      <div className="absolute top-40 right-10 md:right-32 text-[#12AAFF] opacity-10 transform rotate-6 pointer-events-none">
        <svg width="100" height="40" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10,20 C40,0 60,40 90,20" />
          <path d="M85,15 L90,20 L85,25" />
        </svg>
      </div>

      <div className="container mx-auto px-4 z-10 text-center flex-shrink-0 mb-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto space-y-6"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tighter leading-[1.1]">
            Closer moments from <br />
            the <span className="relative inline-block text-[#12AAFF]">
              creators you love.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.6" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Exclusive moments, shared by creators — no subscriptions, just appreciation.
          </p>

          <div className="pt-4 pb-8 relative">
            <button
              onClick={onLaunch}
              className="relative group bg-[#12AAFF] text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
            >
              Explore Moments
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 3D Infinite Carousel - Anchored to bottom */}
      <div className="w-full pb-10">
        <Carousel />
      </div>

    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-start gap-4"
  >
    <div className="p-3 bg-blue-50 text-[#12AAFF] rounded-xl">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const Features = () => (
  <section className="py-24 px-4 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Arbifans?</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Built for the future of creator economy on the most advanced L2.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FeatureCard
          icon={Zap}
          title="Instant Payouts"
          desc="No more waiting for monthly checks. Payments stream directly to your wallet in real-time."
          delay={0.1}
        />
        <FeatureCard
          icon={Shield}
          title="Private & Secure"
          desc="Content is encrypted and stored on IPFS. Only subscribers with active streams can decrypt."
          delay={0.2}
        />
        <FeatureCard
          icon={Wallet}
          title="Low Fees"
          desc="Powered by Arbitrum L2, transactions cost pennies. Keep more of what you earn."
          delay={0.3}
        />
        <FeatureCard
          icon={Users}
          title="True Ownership"
          desc="You own your audience. Port your subscribers and content anywhere, anytime."
          delay={0.4}
        />
      </div>
    </div>
  </section>
);

const Ticker = () => {
  const items = [
    "Alice earned 2.4 ETH today", "CreatorDAO is live", "Bob just joined",
    "New feature alert: NFT Gating", "Sarah reached 1k subs", "Welcome to the future",
    "Arbifans v1 public beta", "Mint your profile now"
  ];

  return (
    <div className="bg-[#F3F4F6] py-12 overflow-hidden border-y border-gray-200">
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12 items-center">
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-500 font-medium text-lg">
              <CheckCircle size={18} className="text-[#12AAFF]" />
              {item}
            </div>
          ))}
        </div>

        {/* Duplicate for smooth loop */}
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-12 items-center ml-12">
          {[...items, ...items, ...items].map((item, i) => (
            <div key={`d-${i}`} className="flex items-center gap-3 text-gray-500 font-medium text-lg">
              <CheckCircle size={18} className="text-[#12AAFF]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-white py-12 px-4 border-t border-gray-100">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="text-2xl font-bold tracking-tight text-gray-900">Arbifans</span>
        <span className="text-sm text-gray-400">Built on Arbitrum Sepolia</span>
      </div>

      <div className="flex gap-8">
        <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-[#12AAFF] transition-colors">
          <Code size={18} /> Smart Contract
        </a>
        <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-[#12AAFF] transition-colors">
          <Twitter size={18} /> Twitter
        </a>
        <a href="#" className="flex items-center gap-2 text-gray-500 hover:text-[#12AAFF] transition-colors">
          <FileText size={18} /> Docs
        </a>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, authenticated, logout } = usePrivy();
  // We can track if the user intentionally launched the app to verify wallet creation if needed, 
  // but standard Privy flow creates embedded wallet on login if configured (which it is).

  // useEffect(() => {
  //   logout();
  // }, []);


  const handleLaunch = () => {
    if (!authenticated) {
      login();
    }
  };

  useEffect(() => {
    if (authenticated) {
      navigate("/mainpage");
    }
  }, [authenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-['Plus_Jakarta_Sans'] selection:bg-[#12AAFF] selection:text-white">
      <Navbar onLaunch={handleLaunch} />
      <Hero onLaunch={handleLaunch} />
      <Features />
      <Ticker />
      <Footer />
    </div>
  );
}
