import { useState, useEffect } from 'react';
import { 
  Baby, Mic, TrendingUp, Activity, CheckCircle, 
  Camera, BarChart3, Settings, FileText, Play, Pause, Volume2, User
} from 'lucide-react';

const Dashboard = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  
  const [babbleData, setBabbleData] = useState([
    { time: '0s', canonical: 65, nonCanonical: 35, frequency: 45 },
    { time: '5s', canonical: 70, nonCanonical: 30, frequency: 52 },
    { time: '10s', canonical: 68, nonCanonical: 32, frequency: 48 },
    { time: '15s', canonical: 72, nonCanonical: 28, frequency: 55 },
    { time: '20s', canonical: 75, nonCanonical: 25, frequency: 60 },
  ]);

  const riskAssessment = [
    { condition: "Autism Spectrum Disorder (ASD)", risk: 12, status: "Low Risk", color: "bg-[#809671]" },
    { condition: "Developmental Language Disorder (DLD)", risk: 8, status: "Very Low Risk", color: "bg-[#809671]" },
    { condition: "Hearing Impairment", risk: 5, status: "Minimal Risk", color: "bg-[#809671]" },
  ];

  const metrics = [
    { label: "Sessions Today", value: "3", icon: <Activity className="w-5 h-5" /> },
    { label: "Total Recordings", value: "47", icon: <Mic className="w-5 h-5" /> },
    { label: "Babble Score", value: "85/100", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Next Milestone", value: "2 weeks", icon: <Baby className="w-5 h-5" /> },
  ];

  useEffect(() => {
    let interval: number | undefined;
    if (isMonitoring) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
        setSessionTime(prev => prev + 1);
        
        setBabbleData(prev => {
          const newData = [...prev];
          if (newData.length > 20) newData.shift();
          
          newData.push({
            time: `${prev.length * 5}s`,
            canonical: 65 + Math.random() * 15,
            nonCanonical: 25 + Math.random() * 15,
            frequency: 40 + Math.random() * 25
          });
          
          return newData;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maxCanonical = Math.max(...babbleData.map(d => d.canonical));
  const maxNonCanonical = Math.max(...babbleData.map(d => d.nonCanonical));
  const maxValue = Math.max(maxCanonical, maxNonCanonical);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E0D8] to-[#E5D2B8]">
      <nav className="bg-[#725C3A]/95 backdrop-blur-sm border-b border-[#D2AB80]/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-xl flex items-center justify-center shadow-md">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mimicoo Dashboard</h1>
              <p className="text-xs text-[#E5D2B8]">Real-time babble analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-3xl mb-4 shadow-lg">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-[#725C3A]">Welcome back, Parent!</h2>
          <p className="text-[#725C3A]/80">Your advanced babble monitoring system is ready and operational.</p>
          <p className="text-sm text-[#725C3A]/70 mt-1">Let's continue monitoring your baby's vocal development.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, i) => (
            <div key={i} className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-[#809671]">{metric.icon}</div>
                <span className="text-sm text-[#725C3A]/70">{metric.label}</span>
              </div>
              <div className="text-2xl font-bold text-[#725C3A]">{metric.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                    <Camera className="w-5 h-5 text-[#809671]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#725C3A]">Live Monitoring</h3>
                    <p className="text-sm text-[#725C3A]/70">Real-time babble analysis and AI processing</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isMonitoring ? 'bg-[#809671]/20 text-[#809671]' : 'bg-gray-400/20 text-gray-600'}`}>
                  {isMonitoring ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="bg-[#725C3A]/10 rounded-xl h-64 mb-4 flex items-center justify-center relative overflow-hidden border border-[#D2AB80]/20">
                {isMonitoring ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#809671]/10 to-[#B3B792]/10"></div>
                    <div className="relative z-10 text-center">
                      <Volume2 className="w-16 h-16 mx-auto mb-4 text-[#809671] animate-pulse" />
                      <p className="text-lg font-medium text-[#725C3A]">Listening to baby babble...</p>
                      <p className="text-sm text-[#725C3A]/70 mt-2">Session Time: {formatTime(sessionTime)}</p>
                      
                      <div className="mt-4 flex items-center justify-center gap-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 rounded-full transition-all ${
                              i < (audioLevel / 5) ? 'bg-[#809671] h-8' : 'bg-[#D2AB80] h-4'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-[#725C3A]/40" />
                    <p className="text-[#725C3A]/60">Camera & Audio Input Ready</p>
                    <p className="text-sm text-[#725C3A]/50 mt-2">Click Start Monitoring to begin</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isMonitoring ? (
                  <button
                    onClick={() => setIsMonitoring(true)}
                    className="flex-1 bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <Play className="w-5 h-5" />
                    Start Monitoring
                  </button>
                ) : (
                  <button
                    onClick={() => setIsMonitoring(false)}
                    className="flex-1 bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <Pause className="w-5 h-5" />
                    Stop Monitoring
                  </button>
                )}
                <button className="px-6 py-3 bg-[#D2AB80]/30 hover:bg-[#D2AB80]/40 border border-[#D2AB80]/50 text-[#725C3A] rounded-xl font-semibold transition-all">
                  Calibrate System
                </button>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#809671]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#725C3A]">Babble Pattern Analysis</h3>
                    <p className="text-sm text-[#725C3A]/70">Real-time vocal pattern tracking</p>
                  </div>
                </div>
                <button className="text-sm text-[#809671] hover:text-[#6d8060]">Last 24 hours</button>
              </div>

              <div className="h-64 flex items-end gap-2 px-4 pb-8 relative">
                <div className="absolute bottom-8 left-0 right-0 h-px bg-[#D2AB80]/30"></div>
                {babbleData.slice(-12).map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full flex flex-col items-center gap-0.5">
                      <div 
                        className="w-full bg-[#809671] rounded-t-sm transition-all"
                        style={{ height: `${(data.canonical / maxValue) * 200}px` }}
                      ></div>
                      <div 
                        className="w-full bg-[#D2AB80] transition-all"
                        style={{ height: `${(data.nonCanonical / maxValue) * 200}px` }}
                      ></div>
                    </div>
                    {i % 3 === 0 && (
                      <span className="text-xs text-[#725C3A]/50 mt-1">{data.time}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#D2AB80]/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#809671] rounded-full"></div>
                  <span className="text-sm text-[#725C3A]/70">Canonical Babbling</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#D2AB80] rounded-full"></div>
                  <span className="text-sm text-[#725C3A]/70">Non-Canonical</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#809671]" />
                </div>
                <h3 className="font-semibold text-[#725C3A]">System Status</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#725C3A]/70">AI Model</span>
                  <span className="flex items-center gap-2 text-sm text-[#725C3A]">
                    <div className="w-2 h-2 bg-[#809671] rounded-full"></div>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#725C3A]/70">Audio Processed</span>
                  <span className="text-sm font-medium text-[#725C3A]">960 samples</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#725C3A]/70">Queue</span>
                  <span className="text-sm font-medium text-[#725C3A]">0</span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#D2AB80]/30 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#725C3A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#725C3A]">Risk Assessment</h3>
                  <p className="text-xs text-[#725C3A]/70">AI-powered analysis</p>
                </div>
              </div>

              <div className="space-y-4">
                {riskAssessment.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#725C3A]">{item.condition}</span>
                      <span className="text-lg font-bold text-[#725C3A]">{item.risk}%</span>
                    </div>
                    <div className="w-full bg-[#E5E0D8] rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.risk}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${item.color} bg-opacity-20 text-[#725C3A]`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-[#809671]/10 border border-[#809671]/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#809671] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#809671]">Normal Development</p>
                    <p className="text-xs text-[#725C3A]/70 mt-1">All metrics within expected ranges for age group</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <h3 className="font-semibold mb-4 text-[#725C3A]">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  className="w-full py-3 bg-[#D2AB80]/30 hover:bg-[#D2AB80]/40 border border-[#D2AB80]/50 rounded-xl text-sm font-medium text-[#725C3A] transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Learning Resources
                </button>
                <button className="w-full py-3 bg-[#D2AB80]/30 hover:bg-[#D2AB80]/40 border border-[#D2AB80]/50 text-[#725C3A] rounded-xl text-sm font-medium transition-all">
                  Download Report (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;