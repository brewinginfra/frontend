import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Environment, Torus } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Wallet, Users, Twitter, FileText, Code, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';

const FluidTorus = () => {
  return (
    <group position={[0, -2.5, 0]}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <Torus args={[3.5, 0.4, 128, 64]} rotation={[2, 0, 0]}>
          <MeshDistortMaterial
            color="#12AAFF"
            envMapIntensity={2}
            clearcoat={1}
            clearcoatRoughness={0}
            metalness={0.2}
            roughness={0}
            distort={0.4}
            speed={2}
            transparent={true}
            opacity={0.9}
          />
        </Torus>
      </Float>
    </group>
  );
};

const Navbar = ({ onLaunch }: { onLaunch: () => void }) => (
  <nav className="fixed top-6 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 max-w-5xl mx-auto bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-full transition-all hover:bg-white/80">
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold tracking-tight text-gray-900">Arbifans</span>
    </div>
    
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
      <a href="#" className="hover:text-[#12AAFF] transition-colors">Ecosystem</a>
      <a href="#" className="hover:text-[#12AAFF] transition-colors">Governance</a>
      <a href="#" className="hover:text-[#12AAFF] transition-colors">Documentation</a>
    </div>

     <div className="flex items-center gap-4">
        {/* Added wallet connect here for completeness since user asked for it in spec initially */}
        {/* <ConnectButton.Custom>
           {({ openConnectModal, mounted }) => (
             <button 
               onClick={openConnectModal}
               disabled={!mounted}
               className="hidden md:flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-700 bg-transparent border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
             >
                Connect Wallet
             </button>
           )}
        </ConnectButton.Custom> */}

        <button 
          onClick={onLaunch}
          className="px-6 py-2 text-sm font-bold text-white bg-[#12AAFF] rounded-full hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
        >
          Launch App
        </button>
     </div>
  </nav>
);

const Hero = ({ onLaunch }: { onLaunch: () => void }) => {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F3F4F6] to-white">
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Canvas className="w-full h-full" camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <Environment preset="studio" />
          <Suspense fallback={null}>
            <FluidTorus />
          </Suspense>
        </Canvas>
      </div>
      
      <div className="relative z-20 text-center max-w-5xl px-4 -mt-20 pointer-events-none">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[#12AAFF] font-bold text-lg tracking-widest uppercase mb-4"
        >
          EARN EVERY SECOND
        </motion.p>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 drop-shadow-sm leading-none mb-8"
        >
          Arbifans
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-12"
        >
          Welcome to Arbifans, the protocol for money streaming. <br />
          Join the revolution of decentralized content.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pointer-events-auto"
        >
          <button 
            onClick={onLaunch}
            className="group relative px-10 py-5 bg-black text-white rounded-full text-lg font-bold overflow-hidden shadow-2xl transition-all hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              Launch App <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
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
    <div className="min-h-screen bg-[#F3F4F6] font-[Inter] selection:bg-[#12AAFF] selection:text-white">
      <Navbar onLaunch={handleLaunch} />
      <Hero onLaunch={handleLaunch} />
      <Features />
      <Ticker />
      <Footer />
    </div>
  );
}
