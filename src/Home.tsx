import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Heart, Mic, TrendingUp, Shield, Globe, Sparkles, ChevronRight, Play, Brain, BarChart3 } from 'lucide-react';
import Logo from "./assets/Logo.svg";
import Stephanie from "./assets/Stephanie.png";
import Katrina from "./assets/Katrina.jpg";
import Rahbir from "./assets/Rahbir.jpg";
import Fraz from "./assets/Fraz.jpg";


const Home = () => {
  const navigate = useNavigate();
  const [, setScrollY] = useState(0);
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

  const teamMembers = [
    { name: "Mohammed Faraz Kabbo", role: "CS @ Yorku", img: Fraz, github: "https://github.com/farazkabbo", linkedin: "https://www.linkedin.com/in/mohammed-faraz-kabbo/" },
    { name: "Md Rahbir Mahdi", role: "CS @ Yorku", img: Rahbir, github: "https://github.com/Rahbir1518", linkedin: "https://www.linkedin.com/in/rahbirmahdi/" },
    { name: "Katrina Jin", role: "Speech Pathologist", img: Katrina, github: "#", linkedin: "https://www.linkedin.com/in/katrina-jin-608792298/" },
    { name: "Stephanie", role: "Full Stack Developer", img: Stephanie, github: "#", linkedin: "#" }
  ];

  return (
    <div className="min-h-screen bg-[#E5E0D8] text-[#725C3A]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#E5E0D8]/95 backdrop-blur-sm border-b border-[#D2AB80]/30 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 hover:cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <img src={Logo}/>
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
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#809671]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#B3B792]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5D2B8] rounded-full mb-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 text-[#809671] animate-pulse" />
              <span className="text-sm font-medium">Your Baby's Voice Could Save Their Future</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Turn <span className="inline-block hover:scale-110 transition-transform duration-300">Babble</span> Into
              <span className="block mt-2 bg-gradient-to-r from-[#809671] to-[#B3B792] bg-clip-text text-transparent animate-pulse">
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
                className="group px-8 py-4 bg-gradient-to-r from-[#809671] to-[#B3B792] text-white rounded-full font-semibold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 hover:cursor-pointer animate-pulse hover:animate-none"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group px-8 py-4 bg-[#E5D2B8] text-[#725C3A] rounded-full font-semibold hover:bg-[#D2AB80] transition-all flex items-center gap-2 hover:cursor-pointer hover:shadow-lg transform hover:scale-105">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-[#E5E0D8] to-[#E5D2B8] relative overflow-hidden">
        {/* Animated background accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#809671] to-transparent opacity-50"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block">
              How Mimicoo Works
            </h2>
            <p className="text-xl text-[#725C3A]/70">Cutting-edge AI meets child-friendly design</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl hover:shadow-2xl transition-all transform hover:-translate-y-2 group cursor-pointer"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${i * 0.1}s both`
                }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  {React.cloneElement(feature.icon, { className: "w-7 h-7 text-white" })}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#809671] transition-colors">{feature.title}</h3>
                <p className="text-[#725C3A]/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-[#E5D2B8] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block">
              Simple. Passive. Powerful.
            </h2>
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
                className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl flex items-center gap-8 hover:shadow-xl transition-all transform hover:translate-x-2 cursor-pointer group"
                style={{
                  animation: `slideInRight 0.6s ease-out ${i * 0.15}s both`
                }}
              >
                <div className="text-6xl font-bold text-[#809671]/20 group-hover:text-[#809671]/40 group-hover:scale-110 transition-all duration-300">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[#809671] transition-colors">{item.title}</h3>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block">
              Real Impact, Real Results
            </h2>
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
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl text-center hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${i * 0.2}s both`
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  {React.cloneElement(impact.icon, { className: "w-8 h-8 text-white" })}
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-[#809671] transition-colors">{impact.title}</h3>
                <p className="text-[#725C3A]/70 mb-4">{impact.desc}</p>
                <div className="text-lg font-semibold text-[#809671] group-hover:scale-110 inline-block transition-transform">
                  {impact.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#809671] to-[#B3B792] p-12 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500">
            <Globe className="w-16 h-16 text-white mx-auto mb-6 animate-pulse" />
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

      {/* Team Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#E5E0D8] to-[#E5D2B8]">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#725C3A] to-[#809671] bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-xl text-[#725C3A]/70 max-w-2xl mx-auto">
              Built by passionate innovators dedicated to early childhood development
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {teamMembers.map((member, idx) => (
              <div 
                key={idx} 
                className={`text-center group transform transition-all duration-700 hover:scale-105 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${idx * 150 + 300}ms` }}
              >
                <div className="relative mb-4 mx-auto w-32 h-32">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover shadow-lg group-hover:shadow-2xl transition-all duration-300 border-4 border-white group-hover:border-[#809671]/30 transform group-hover:rotate-3"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#809671]/30 to-transparent opacity-0 group-hover:opacity-100 rounded-full transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex space-x-3">
                      <a 
                        href={member.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                      >
                        <svg className="w-4 h-4 text-[#725C3A]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                      >
                        <svg className="w-4 h-4 text-[#809671]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-[#725C3A] text-lg group-hover:text-[#809671] transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-sm text-[#725C3A]/60 group-hover:text-[#725C3A]/80 transition-colors duration-300">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
          
          <div className={`text-center transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-sm text-[#725C3A]/60 italic transform transition-all duration-300 hover:text-[#725C3A] hover:scale-105">
              "Late nights, lots of research, and a shared vision of making early detection accessible to every family!"
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#725C3A] text-white py-12 px-6 relative overflow-hidden">
        {/* Animated background accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#809671] to-transparent"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6 group">
            <div className="w-10 h-10 bg-[#809671] rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              {/* <Baby className="w-6 h-6 text-white" /> */}
              <img src={Logo}/>
            </div>
            <span className="text-2xl font-bold group-hover:text-[#B3B792] transition-colors duration-300">Mimicoo</span>
          </div>
          <p className="text-white/70 mb-6 hover:text-white/90 transition-colors duration-300">
            Private. Playful. Powerful. Early detection for every child.
          </p>
          <div className="flex justify-center gap-8 text-sm text-white/60 mb-4">
            <a href="#" className="hover:text-white transition-all duration-300 hover:scale-110 inline-block">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-all duration-300 hover:scale-110 inline-block">Terms of Service</a>
            <a href="#" className="hover:text-white transition-all duration-300 hover:scale-110 inline-block">Contact Us</a>
          </div>
          <div className="text-xs text-white/40 mt-8">
            © 2025 Mimicoo. All rights reserved. Made with ❤️ for families everywhere.
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;