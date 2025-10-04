import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Heart, Mic, TrendingUp, Shield, Globe, Sparkles, ChevronRight, Play, Brain, Baby, BarChart3 } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Passive Monitoring",
      description: "Captures babble naturally during play, feeding, or bedtime"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Deep learning identifies canonical babbling and speech patterns"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Visual milestones compared to CDC and WHO benchmarks"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Voice data stays on-device. Encrypted, salted, opt-in only"
    }
  ];

  const stats = [
    { value: "50%", label: "Faster Diagnosis" },
    { value: "90%", label: "Lower Parental Anxiety" },
    { value: "$500M+", label: "Annual Healthcare Savings" },
    { value: "1 in 6", label: "Children Affected" }
  ];

  return (
    <div className="min-h-screen bg-[#E5E0D8] text-[#725C3A]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#E5E0D8]/95 backdrop-blur-sm border-b border-[#D2AB80]/30 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 hover:cursor-pointer">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-full flex items-center justify-center">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#725C3A]">Mimicoo</span>
          </div>
          </button>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="hover:text-[#809671] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#809671] transition-colors">How It Works</a>
            <a href="#impact" className="hover:text-[#809671] transition-colors">Impact</a>
            
            <SignedOut>
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-[#809671] text-white rounded-full hover:bg-[#B3B792] transition-all transform hover:scale-105 hover:cursor-pointer"
              >
                Sign In
              </button>
            </SignedOut>
            
            <SignedIn>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-[#809671] text-white rounded-full hover:bg-[#B3B792] transition-all hover:cursor-pointer"
              >
                Dashboard
              </button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5D2B8] rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#809671]" />
              <span className="text-sm font-medium">Your Baby's Voice Could Save Their Future</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Turn Mimicoo Into
              <span className="block mt-2 bg-gradient-to-r from-[#809671] to-[#B3B792] bg-clip-text text-transparent">
                Clinical Insight
              </span>
            </h1>
            
            <p className="text-xl text-[#725C3A]/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              AI-powered companion that detects developmental delays through natural babble analysis. 
              Early detection, private monitoring, powerful results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => navigate('/signup')}
                className="group px-8 py-4 bg-gradient-to-r from-[#809671] to-[#B3B792] text-white rounded-full font-semibold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 hover:cursor-pointer"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-[#E5D2B8] text-[#725C3A] rounded-full font-semibold hover:bg-[#D2AB80] transition-all flex items-center gap-2 hover:cursor-pointer">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, i) => (
              <div 
                key={i}
                className={`bg-white/60 backdrop-blur-sm p-6 rounded-2xl text-center transition-all duration-700 transform hover:scale-105 hover:shadow-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl font-bold text-[#809671] mb-2">{stat.value}</div>
                <div className="text-sm text-[#725C3A]/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-[#E5E0D8] to-[#E5D2B8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How Mimicoo Works</h2>
            <p className="text-xl text-[#725C3A]/70">Cutting-edge AI meets child-friendly design</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl hover:shadow-2xl transition-all transform hover:-translate-y-2 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                  {React.cloneElement(feature.icon, { className: "w-7 h-7 text-white" })}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[#725C3A]/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-[#E5D2B8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple. Passive. Powerful.</h2>
            <p className="text-xl text-[#725C3A]/70">No extra work for parents</p>
          </div>

          <div className="space-y-8">
            {[
              { step: "01", title: "Passive Collection", desc: "App listens during play, feeding, or stroller time" },
              { step: "02", title: "AI Analysis", desc: "Analyzes canonical babbling, turn-taking, and vocal patterns" },
              { step: "03", title: "Risk Detection", desc: "Flags atypical patterns and recommends next steps" },
              { step: "04", title: "Track Progress", desc: "Simple dashboards vs. developmental benchmarks" }
            ].map((item, i) => (
              <div 
                key={i}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl flex items-center gap-8 hover:shadow-xl transition-all transform hover:translate-x-2"
              >
                <div className="text-6xl font-bold text-[#809671]/20">{item.step}</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-[#725C3A]/70 text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 px-6 bg-gradient-to-b from-[#E5D2B8] to-[#E5E0D8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Real Impact, Real Results</h2>
            <p className="text-xl text-[#725C3A]/70">From prevention to diagnosis</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Faster Diagnoses",
                desc: "Detect deviations months before traditional screenings",
                stat: "50% reduction in wait times"
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Lower Anxiety",
                desc: "Continuous monitoring gives parents peace of mind",
                stat: "90% stress reduction"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Cost Savings",
                desc: "Earlier interventions mean better outcomes",
                stat: "$500M+ saved annually"
              }
            ].map((impact, i) => (
              <div 
                key={i}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl text-center hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-full flex items-center justify-center mx-auto mb-6">
                  {React.cloneElement(impact.icon, { className: "w-8 h-8 text-white" })}
                </div>
                <h3 className="text-2xl font-bold mb-3">{impact.title}</h3>
                <p className="text-[#725C3A]/70 mb-4">{impact.desc}</p>
                <div className="text-lg font-semibold text-[#809671]">{impact.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#809671] to-[#B3B792] p-12 rounded-3xl shadow-2xl">
            <Globe className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">Every Child Deserves a Fair Start</h2>
            <p className="text-white/90 text-lg mb-8">
              Join thousands of parents using AI to catch developmental delays early
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="px-10 py-4 bg-white text-[#809671] rounded-full font-bold text-lg hover:bg-[#E5E0D8] transition-all transform hover:scale-105 shadow-xl hover:cursor-pointer"
            >
              Start Free Trial Today
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#725C3A] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#809671] rounded-full flex items-center justify-center">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Mimicoo</span>
          </div>
          <p className="text-white/70 mb-6">
            Private. Playful. Powerful. Early detection for every child.
          </p>
          <div className="flex justify-center gap-8 text-sm text-white/60">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;