import { useState, useEffect, useRef } from 'react';
import { 
  Baby, Mic, TrendingUp, Activity, CheckCircle, 
  Camera, BarChart3, Settings, FileText, Play, Pause, Volume2, User, Upload, Loader
} from 'lucide-react';

interface AudioFeatures {
  avg_pitch: number;
  pitch_variability: number;
  avg_energy: number;
  voicing_ratio: number;
  duration: number;
  pitch_time_series: number[];
  pitch_timestamps: number[];
  rms_time_series: number[];
  rms_timestamps: number[];
}

interface RiskItem {
  condition: string;
  risk: number;
  status: string;
  color: string;
}

interface WebSocketMessage {
  type: 'status' | 'features' | 'analysis' | 'complete' | 'error' | 'pong';
  message?: string;
  data?: any;
}

interface AnalysisResult {
  risk_assessment: Array<{
    condition: string;
    risk_percentage: number;
    status: string;
    reasoning: string;
  }>;
  overall_status: string;
  next_steps: string[];
  key_findings: string;
}

const Dashboard = () => {
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null);
  const [baseFeatures, setBaseFeatures] = useState<AudioFeatures | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskItem[]>([
    { condition: "Autism Spectrum Disorder (ASD)", risk: 12, status: "Low Risk", color: "bg-[#809671]" },
    { condition: "Developmental Language Disorder (DLD)", risk: 8, status: "Very Low Risk", color: "bg-[#809671]" },
    { condition: "Hearing Impairment", risk: 5, status: "Minimal Risk", color: "bg-[#809671]" },
  ]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [keyFindings, setKeyFindings] = useState<string>("Upload audio to begin analysis");

  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const metrics = [
    { label: "Sessions Today", value: "3", icon: <Activity className="w-5 h-5" /> },
    { label: "Total Recordings", value: "47", icon: <Mic className="w-5 h-5" /> },
    { label: "Babble Score", value: "85/100", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Next Milestone", value: "2 weeks", icon: <Baby className="w-5 h-5" /> },
  ];

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:8000/ws');
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };
    
    wsRef.current.onmessage = (event: MessageEvent) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      if (message.type === 'status') {
        setProcessingStatus(message.message || '');
      } else if (message.type === 'pong') {
        console.log('WebSocket ping successful');
      }
    };
    
    wsRef.current.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isMonitoring) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingStatus('Uploading and analyzing audio...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload-base-audio', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        // Set uploaded audio features
        setAudioFeatures(result.uploaded_features);
        
        // Set base audio features if available
        if (result.base_features) {
          setBaseFeatures(result.base_features);
          setProcessingStatus('Comparison complete! Displaying results...');
        } else {
          setProcessingStatus('Audio analyzed (no base reference found)');
        }
        
        // Update analysis results
        if (result.analysis) {
          const analysis = result.analysis;
          
          const updatedRisks: RiskItem[] = analysis.risk_assessment.map((item: any) => ({
            condition: item.condition,
            risk: item.risk_percentage,
            status: item.status,
            color: item.risk_percentage < 30 ? "bg-[#809671]" : 
                   item.risk_percentage < 60 ? "bg-yellow-500" : "bg-red-500"
          }));
          setRiskAssessment(updatedRisks);
          
          setNextSteps(analysis.next_steps || []);
          setKeyFindings(analysis.key_findings || "Analysis complete");
        }
        
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingStatus('');
        }, 2000);
      } else {
        setProcessingStatus('Upload failed: ' + result.message);
        setIsProcessing(false);
      }
    } catch (error) {
      setProcessingStatus('Upload error: ' + (error as Error).message);
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPitchGraph = () => {
    if (!audioFeatures || !audioFeatures.pitch_time_series) return null;

    const pitchData = audioFeatures.pitch_time_series;
    const pitchTimes = audioFeatures.pitch_timestamps;
    const maxPitch = Math.max(...pitchData.filter(p => p > 0));
    
    const basePitchData = baseFeatures?.pitch_time_series || [];
    const baseMaxPitch = basePitchData.length > 0 ? Math.max(...basePitchData.filter(p => p > 0)) : 0;
    const maxPitchOverall = Math.max(maxPitch, baseMaxPitch, 100);
    
    const sampleStep = Math.ceil(pitchData.length / 100);
    const width = 800;

    // Generate points for uploaded audio
    const uploadedPoints = pitchData
      .filter((_: number, i: number) => i % sampleStep === 0)
      .map((pitch: number, i: number, arr: number[]) => {
        const x = (i / (arr.length - 1)) * width;
        const y = pitch > 0 ? 240 - (pitch / maxPitchOverall) * 240 : 240;
        return `${x},${y}`;
      })
      .join(' ');

    // Generate points for base audio
    let basePoints = '';
    if (baseFeatures && basePitchData.length > 0) {
      const baseSampleStep = Math.ceil(basePitchData.length / 100);
      basePoints = basePitchData
        .filter((_: number, i: number) => i % baseSampleStep === 0)
        .map((pitch: number, i: number, arr: number[]) => {
          const x = (i / (arr.length - 1)) * width;
          const y = pitch > 0 ? 240 - (pitch / maxPitchOverall) * 240 : 240;
          return `${x},${y}`;
        })
        .join(' ');
    }

    return (
      <div className="h-64 px-4 pb-8 relative">
        <svg width="100%" height="240" viewBox={`0 0 ${width} 240`} preserveAspectRatio="none" className="overflow-visible">
          {/* Grid lines */}
          <line x1="0" y1="240" x2={width} y2="240" stroke="#D2AB80" strokeOpacity="0.3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="180" x2={width} y2="180" stroke="#D2AB80" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="120" x2={width} y2="120" stroke="#D2AB80" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="60" x2={width} y2="60" stroke="#D2AB80" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="0" x2={width} y2="0" stroke="#D2AB80" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          
          {/* Base audio line */}
          {baseFeatures && basePoints && (
            <polyline
              points={basePoints}
              fill="none"
              stroke="#FF6B35"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
          
          {/* Uploaded audio line */}
          <polyline
            points={uploadedPoints}
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 bottom-0 text-xs text-[#725C3A]/50">0 Hz</div>
        <div className="absolute left-0 top-0 text-xs text-[#725C3A]/50">{maxPitchOverall.toFixed(0)} Hz</div>
        
        {/* Legend */}
        <div className="absolute top-0 right-4 flex gap-4 text-xs text-[#725C3A]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[#2E7D32]"></div>
            <span>Uploaded</span>
          </div>
          {baseFeatures && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-[#FF6B35]"></div>
              <span>Base</span>
            </div>
          )}
        </div>
        
        {/* X-axis time labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-[#725C3A]/50">
          <span>0s</span>
          <span>{(pitchTimes[pitchTimes.length - 1] || 0).toFixed(1)}s</span>
        </div>
      </div>
    );
  };

  const renderEnergyGraph = () => {
    if (!audioFeatures || !audioFeatures.rms_time_series) return null;

    const rmsData = audioFeatures.rms_time_series;
    const rmsTimes = audioFeatures.rms_timestamps;
    const maxRMS = Math.max(...rmsData);
    
    const baseRMSData = baseFeatures?.rms_time_series || [];
    const baseMaxRMS = baseRMSData.length > 0 ? Math.max(...baseRMSData) : 0;
    const maxRMSOverall = Math.max(maxRMS, baseMaxRMS, 0.001);
    
    const sampleStep = Math.ceil(rmsData.length / 100);
    const width = 800;

    // Generate points for uploaded audio
    const uploadedPoints = rmsData
      .filter((_: number, i: number) => i % sampleStep === 0)
      .map((rms: number, i: number, arr: number[]) => {
        const x = (i / (arr.length - 1)) * width;
        const y = 240 - (rms / maxRMSOverall) * 240;
        return `${x},${y}`;
      })
      .join(' ');

    // Generate points for base audio
    let basePoints = '';
    if (baseFeatures && baseRMSData.length > 0) {
      const baseSampleStep = Math.ceil(baseRMSData.length / 100);
      basePoints = baseRMSData
        .filter((_: number, i: number) => i % baseSampleStep === 0)
        .map((rms: number, i: number, arr: number[]) => {
          const x = (i / (arr.length - 1)) * width;
          const y = 240 - (rms / maxRMSOverall) * 240;
          return `${x},${y}`;
        })
        .join(' ');
    }

    return (
      <div className="h-64 px-4 pb-8 relative">
        <svg width="100%" height="240" viewBox={`0 0 ${width} 240`} preserveAspectRatio="none" className="overflow-visible">
          {/* Grid lines */}
          <line x1="0" y1="240" x2={width} y2="240" stroke="#D2AB80" strokeOpacity="0.3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="180" x2={width} y2="180" stroke="#D2AB80" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="120" x2={width} y2="120" stroke="#D2AB80" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="60" x2={width} y2="60" stroke="#D2AB80" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="0" x2={width} y2="0" stroke="#D2AB80" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          
          {/* Base audio line */}
          {baseFeatures && basePoints && (
            <polyline
              points={basePoints}
              fill="none"
              stroke="#9C27B0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
          
          {/* Uploaded audio line */}
          <polyline
            points={uploadedPoints}
            fill="none"
            stroke="#FF9800"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 bottom-0 text-xs text-[#725C3A]/50">0</div>
        <div className="absolute left-0 top-0 text-xs text-[#725C3A]/50">{maxRMSOverall.toFixed(4)}</div>
        
        {/* Legend */}
        <div className="absolute top-0 right-4 flex gap-4 text-xs text-[#725C3A]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[#FF9800]"></div>
            <span>Uploaded</span>
          </div>
          {baseFeatures && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-[#9C27B0]"></div>
              <span>Base</span>
            </div>
          )}
        </div>
        
        {/* X-axis time labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-[#725C3A]/50">
          <span>0s</span>
          <span>{(rmsTimes[rmsTimes.length - 1] || 0).toFixed(1)}s</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E0D8] to-[#E5D2B8]">
      <nav className="bg-[#725C3A]/95 backdrop-blur-sm border-b border-[#D2AB80]/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 hover:cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-xl flex items-center justify-center shadow-md">
                  <Baby className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Mimicoo Dashboard</h1>
                  <p className="text-xs text-[#E5D2B8]">Real-time babble analysis</p>
                </div>
            </button>
            
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.location.href = '/learning'}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium text-sm flex items-center gap-2 hover:cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Learning
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:cursor-pointer">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:cursor-pointer">
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
                    className="flex-1 bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:cursor-pointer"
                  >
                    <Play className="w-5 h-5" />
                    Start Monitoring
                  </button>
                ) : (
                  <button
                    onClick={() => setIsMonitoring(false)}
                    className="flex-1 bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:cursor-pointer"
                  >
                    <Pause className="w-5 h-5" />
                    Stop Monitoring
                  </button>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-[#D2AB80]/30 hover:bg-[#D2AB80]/40 border border-[#D2AB80]/50 text-[#725C3A] rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 hover:cursor-pointer"
                >
                  {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  Upload Audio
                </button>
              </div>
              
              {processingStatus && (
                <div className="mt-3 text-sm text-center text-[#809671] font-medium">
                  {processingStatus}
                </div>
              )}
            </div>

            {audioFeatures && (
              <>
                <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#809671]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#725C3A]">Pitch Analysis (F0)</h3>
                        <p className="text-sm text-[#725C3A]/70">Voiced pitch over time - overlay comparison</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#725C3A]/70">Avg Pitch</p>
                      <p className="text-lg font-bold text-[#2E7D32]">{audioFeatures.avg_pitch} Hz</p>
                      {baseFeatures && (
                        <p className="text-xs text-[#FF6B35] mt-1">Base: {baseFeatures.avg_pitch} Hz</p>
                      )}
                    </div>
                  </div>
                  {renderPitchGraph()}
                </div>

                <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D2AB80]/30 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-[#725C3A]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#725C3A]">RMS Energy Analysis</h3>
                        <p className="text-sm text-[#725C3A]/70">Vocal strength over time - overlay comparison</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#725C3A]/70">Avg Energy</p>
                      <p className="text-lg font-bold text-[#FF9800]">{audioFeatures.avg_energy.toFixed(4)}</p>
                      {baseFeatures && (
                        <p className="text-xs text-[#9C27B0] mt-1">Base: {baseFeatures.avg_energy.toFixed(4)}</p>
                      )}
                    </div>
                  </div>
                  {renderEnergyGraph()}
                </div>
              </>
            )}
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
                  <span className="text-sm font-medium text-[#725C3A]">
                    {audioFeatures ? '1 file' : '0 files'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#725C3A]/70">Base Reference</span>
                  <span className="text-sm font-medium text-[#725C3A]">
                    {baseFeatures ? 'Loaded' : 'Not found'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#725C3A]/70">Duration</span>
                  <span className="text-sm font-medium text-[#725C3A]">
                    {audioFeatures ? `${audioFeatures.duration}s` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#725C3A]/70">Voicing Ratio</span>
                  <span className="text-sm font-medium text-[#725C3A]">
                    {audioFeatures ? `${(audioFeatures.voicing_ratio * 100).toFixed(1)}%` : 'N/A'}
                  </span>
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
                        className={`h-2 rounded-full ${item.color} transition-all duration-500`}
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
                    <p className="text-sm font-medium text-[#809671]">Key Findings</p>
                    <p className="text-xs text-[#725C3A]/70 mt-1">{keyFindings}</p>
                  </div>
                </div>
              </div>
            </div>

            {nextSteps.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
                <h3 className="font-semibold mb-4 text-[#725C3A]">Recommended Next Steps</h3>
                <div className="space-y-3">
                  {nextSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#809671]/5 rounded-lg">
                      <div className="w-6 h-6 bg-[#809671] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-[#725C3A]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <h3 className="font-semibold mb-4 text-[#725C3A]">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  className="w-full py-3 bg-[#D2AB80]/30 hover:bg-[#D2AB80]/40 border border-[#D2AB80]/50 rounded-xl text-sm font-medium text-[#725C3A] transition-all flex items-center justify-center gap-2 hover:cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  View Learning Resources
                </button>
                <button className="w-full py-3 bg-[#D2AB80]/30 hover:bg-[#D2AB80]/40 border border-[#D2AB80]/50 text-[#725C3A] rounded-xl text-sm font-medium transition-all hover:cursor-pointer">
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