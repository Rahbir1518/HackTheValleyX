import { useState, useRef, useEffect } from 'react';
import { 
  Baby, Mic, RefreshCw, Volume2, CheckCircle, AlertCircle,
  Settings, User, Home, Play, Pause, Loader, TrendingUp, BookOpen
} from 'lucide-react';

// Use the environment's handling for the API key by setting it to an empty string.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

interface AnalysisResult {
  score: number;
  feedback: string[];
  strengths: string[];
  improvements: string[];
  clarity: number;
  pronunciation: number;
  fluency: number;
}

const Learning = () => {
  const [currentSentence, setCurrentSentence] = useState<string>('Click "Generate Sentence" to start practicing!');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  // Audio level is normalized to 0-255 from the analyser node
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Utility function for retrying API calls with exponential backoff
  const callApiWithBackoff = async (url: string, payload: any, maxRetries: number = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          return await response.json();
        } else if (response.status === 429 && i < maxRetries - 1) {
          // Retry on 429 Too Many Requests
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Throw error for other HTTP errors or final 429
          const errorText = await response.text();
          throw new Error(`API call failed with status ${response.status}: ${errorText}`);
        }
      } catch (error) {
        if (i === maxRetries - 1) throw error; // Re-throw on final attempt
      }
    }
    // Should be unreachable but satisfies TypeScript
    throw new Error("Failed to call API after multiple retries.");
  };

  const generateSentence = async () => {
    setIsGenerating(true);
    setAnalysisResult(null);
    setRecordedAudio(null);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{
          text: 'Generate a single simple, clear sentence for speech practice. The sentence should be 8-15 words long, appropriate for pronunciation practice, and contain a mix of common words. Just return the sentence, nothing else.'
        }]
      }]
    };

    try {
      const data = await callApiWithBackoff(apiUrl, payload);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const sentence = data.candidates[0].content.parts[0].text.trim().replace(/^['"]|['"]$/g, ''); // Clean quotes
        setCurrentSentence(sentence);
      } else {
        setCurrentSentence('The gentle wind rustled the leaves on the big oak tree.');
      }
    } catch (error) {
      console.error('Error generating sentence:', error);
      setCurrentSentence('Practice makes perfect when learning new skills.');
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start visualization
      visualizeAudio();

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Use webm for broader browser support
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);

        // Stop all tracks on the stream to release microphone access
        stream.getTracks().forEach(track => track.stop());
        
        // Cleanup audio context and animation frame
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAnalysisResult(null); // Clear previous results
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // Use a custom message box instead of alert() if necessary, but console.error is fine for permissions error.
      console.log('Could not access microphone. Please check permissions.'); 
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    // The data array size is half of fftSize (256/2 = 128)
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      // Calculate the average signal level for visualization (0-255)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  };

  const analyzeRecording = async () => {
    if (!recordedAudio) return;

    setIsAnalyzing(true);

    try {
      // Convert audio blob to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(recordedAudio);
      });

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{
          role: "user",
          parts: [
            {
              text: `You are a speech analysis expert. The user recorded themselves reading the following sentence: "${currentSentence}". 
              
              Analyze the audio and provide a detailed analysis focusing on clarity, pronunciation, fluency, and pacing. 
              
              Provide a detailed analysis in the following JSON format (respond ONLY with valid JSON, no other text or markdown fences):
              {
                "score": <number 0-100>,
                "feedback": ["point 1", "point 2", "point 3"],
                "strengths": ["strength 1", "strength 2"],
                "improvements": ["improvement 1", "improvement 2"],
                "clarity": <number 0-100>,
                "pronunciation": <number 0-100>,
                "fluency": <number 0-100>
              }
              
              Be encouraging but honest. Base your analysis on the provided audio file.`,
            },
            {
              inlineData: {
                mimeType: recordedAudio.type,
                data: base64Audio
              }
            }
          ]
        }]
      };

      const data = await callApiWithBackoff(apiUrl, payload);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        let responseText = data.candidates[0].content.parts[0].text.trim();
        
        // The API is instructed to return only JSON, but we clean up potential fences just in case.
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
          const result = JSON.parse(responseText);
          setAnalysisResult(result);
        } catch (parseError) {
          console.error('Failed to parse AI response JSON:', parseError);
          // Fallback analysis if JSON parsing fails
          setAnalysisResult({
            score: 75,
            feedback: [
              'The AI could not process the analysis response. Here is a generic feedback:',
              'Ensure your microphone is clear and the recording environment is quiet.',
              'Focus on a steady reading pace for the next attempt.'
            ],
            strengths: ['Successfully recorded and submitted the audio.'],
            improvements: ['Check the audio quality of the recording.'],
            clarity: 70,
            pronunciation: 70,
            fluency: 70
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing recording:', error);
      // Provide fallback analysis on API call failure
      setAnalysisResult({
        score: 70,
        feedback: [
          'An error occurred during AI analysis. Please check your API key and network connection.',
          'Keep practicing to improve your speaking skills!',
          'Try recording again after generating a new sentence.'
        ],
        strengths: ['The app detected your voice recording successfully.'],
        improvements: ['Check browser compatibility for audio recording.'],
        clarity: 75,
        pronunciation: 70,
        fluency: 65
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-[#809671]';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-[#809671]';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E0D8] to-[#E5D2B8] font-inter">
      {/* Tailwind CSS Font Setup */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
          .visualizer-bar {
            width: 8px;
            border-radius: 9999px;
            transition: all 0.1s ease-out;
            margin: 0 2px;
            min-height: 4px;
          }
        `}
      </style>

      <nav className="bg-[#725C3A]/95 backdrop-blur-sm border-b border-[#D2AB80]/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-xl flex items-center justify-center shadow-md">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mimicoo Learning</h1>
              <p className="text-xs text-[#E5D2B8]">Speech practice & improvement</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mock Nav links - in a real app, these would navigate */}
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium text-sm flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-3xl mb-4 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-[#725C3A]">Speech Practice</h2>
          <p className="text-[#725C3A]/80">Practice reading sentences and get AI-powered feedback to improve your speaking skills.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Practice Sentence Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-[#809671]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#725C3A]">Practice Sentence</h3>
                    <p className="text-sm text-[#725C3A]/70">Read this sentence clearly</p>
                  </div>
                </div>
                <button
                  onClick={generateSentence}
                  disabled={isGenerating || isRecording || isAnalyzing}
                  className="px-4 py-2 bg-[#D2AB80]/30 hover:bg-[#D2AB80]/40 border border-[#D2AB80]/50 text-[#725C3A] rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isGenerating ? 'Generating...' : 'Generate Sentence'}
                </button>
              </div>

              <div className="bg-[#809671]/10 border-l-4 border-[#809671] rounded-lg p-6 mb-6">
                <p className="text-xl text-[#725C3A] leading-relaxed font-medium">
                  "{currentSentence}"
                </p>
              </div>

              {/* Recording / Visualization Area */}
              <div className="bg-[#725C3A]/10 rounded-xl p-6 mb-6 flex items-center justify-center relative overflow-hidden border border-[#D2AB80]/20 min-h-[200px]">
                {isRecording ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#809671]/10 to-[#B3B792]/10"></div>
                    <div className="relative z-10 text-center w-full">
                      <Mic className="w-16 h-16 mx-auto mb-4 text-[#809671] animate-pulse" />
                      <p className="text-lg font-medium text-[#725C3A]">Recording...</p>
                      <p className="text-sm text-[#725C3A]/70 mt-2">Time: {formatTime(recordingTime)}</p>
                      
                      {/* Audio Level Visualizer (Spectrum) */}
                      <div className="mt-6 flex items-center justify-center gap-1 h-16">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className={`visualizer-bar ${
                              // Map 0-255 audioLevel to height from min-height (4px) to max (64px)
                              i < (audioLevel / 12.75) ? 'bg-[#809671]' : 'bg-[#D2AB80]/50'
                            }`}
                            style={{ height: `${Math.max(4, audioLevel * 0.25)}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : recordedAudio ? (
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-[#809671]" />
                    <p className="text-lg font-medium text-[#725C3A]">Recording Complete!</p>
                    <p className="text-sm text-[#725C3A]/70 mt-2">Click "Analyze Recording" to get feedback</p>
                    {/* Audio playback is optional but good practice */}
                    <audio controls className="mt-4 w-full max-w-sm mx-auto rounded-xl">
                      <source src={URL.createObjectURL(recordedAudio)} type={recordedAudio.type} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="text-center">
                    <Mic className="w-16 h-16 mx-auto mb-4 text-[#725C3A]/40" />
                    <p className="text-[#725C3A]/60">Ready to Record</p>
                    <p className="text-sm text-[#725C3A]/50 mt-2">Click Start Recording to begin</p>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3">
                {!isRecording && !recordedAudio && (
                  <button
                    onClick={startRecording}
                    disabled={isGenerating || isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    Start Recording
                  </button>
                )}
                
                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <Pause className="w-5 h-5" />
                    Stop Recording
                  </button>
                )}

                {recordedAudio && !isRecording && (
                  <>
                    <button
                      onClick={analyzeRecording}
                      disabled={isAnalyzing}
                      className="flex-1 bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? <Loader className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Recording'}
                    </button>
                    <button
                      onClick={() => {
                        setRecordedAudio(null);
                        setAnalysisResult(null);
                      }}
                      disabled={isAnalyzing}
                      className="px-6 py-3 bg-[#D2AB80]/30 hover:bg-[#D2AB80]/40 border border-[#D2AB80]/50 text-[#725C3A] rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Analysis Results Card */}
            {analysisResult && (
              <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#809671]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#725C3A]">Analysis Results</h3>
                      <p className="text-sm text-[#725C3A]/70">AI-powered feedback</p>
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-[#725C3A]/5">
                    <p className="text-sm text-[#725C3A]/70">Overall Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(analysisResult.score)}`}>
                      {analysisResult.score}/100
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Metric: Clarity */}
                  <div className="bg-[#725C3A]/5 rounded-xl p-4">
                    <p className="text-xs text-[#725C3A]/70 mb-2">Clarity</p>
                    <p className={`text-2xl font-bold ${getScoreColor(analysisResult.clarity)}`}>
                      {analysisResult.clarity}
                    </p>
                    <div className="w-full bg-[#E5E0D8] rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getScoreBg(analysisResult.clarity)} transition-all duration-500`}
                        style={{ width: `${analysisResult.clarity}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* Metric: Pronunciation */}
                  <div className="bg-[#725C3A]/5 rounded-xl p-4">
                    <p className="text-xs text-[#725C3A]/70 mb-2">Pronunciation</p>
                    <p className={`text-2xl font-bold ${getScoreColor(analysisResult.pronunciation)}`}>
                      {analysisResult.pronunciation}
                    </p>
                    <div className="w-full bg-[#E5E0D8] rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getScoreBg(analysisResult.pronunciation)} transition-all duration-500`}
                        style={{ width: `${analysisResult.pronunciation}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* Metric: Fluency */}
                  <div className="bg-[#725C3A]/5 rounded-xl p-4">
                    <p className="text-xs text-[#725C3A]/70 mb-2">Fluency</p>
                    <p className={`text-2xl font-bold ${getScoreColor(analysisResult.fluency)}`}>
                      {analysisResult.fluency}
                    </p>
                    <div className="w-full bg-[#E5E0D8] rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getScoreBg(analysisResult.fluency)} transition-all duration-500`}
                        style={{ width: `${analysisResult.fluency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Strengths */}
                  <div className="bg-[#809671]/10 border-l-4 border-[#809671] rounded-lg p-4">
                    <h4 className="font-semibold text-[#809671] mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {analysisResult.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-[#725C3A] flex items-start gap-2">
                          <span className="text-[#809671] mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {analysisResult.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm text-[#725C3A] flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* General Feedback Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#809671]" />
                </div>
                <h3 className="font-semibold text-[#725C3A]">General Feedback</h3>
              </div>

              {analysisResult ? (
                <div className="space-y-3">
                  {analysisResult.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#809671]/5 rounded-lg">
                      <div className="w-6 h-6 bg-[#809671] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-[#725C3A]">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-[#725C3A]/60">
                    Record and analyze your speech to receive personalized feedback
                  </p>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <h3 className="font-semibold mb-4 text-[#725C3A]">Tips for Better Practice</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-[#809671]/5 rounded-lg">
                  <div className="w-6 h-6 bg-[#809671] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm text-[#725C3A]">Find a quiet environment for recording</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#809671]/5 rounded-lg">
                  <div className="w-6 h-6 bg-[#809671] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm text-[#725C3A]">Read the sentence slowly and clearly</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#809671]/5 rounded-lg">
                  <div className="w-6 h-6 bg-[#809671] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm text-[#725C3A]">Practice difficult words multiple times</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-[#809671]/5 rounded-lg">
                  <div className="w-6 h-6 bg-[#809671] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    4
                  </div>
                  <p className="text-sm text-[#725C3A]">Maintain consistent volume throughout</p>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-br from-[#809671]/20 to-[#B3B792]/20 border border-[#809671]/30 rounded-2xl p-6 shadow-md">
              <h3 className="font-semibold mb-3 text-[#725C3A]">Practice Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#725C3A]/70">Today's Sessions</span>
                  <span className="text-sm font-medium text-[#725C3A]">
                    {analysisResult ? '1' : '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#725C3A]/70">Sentences Practiced</span>
                  <span className="text-sm font-medium text-[#725C3A]">
                    {recordedAudio ? '1' : '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#725C3A]/70">Average Score</span>
                  <span className={`text-sm font-bold ${analysisResult ? getScoreColor(analysisResult.score) : 'text-[#725C3A]'}`}>
                    {analysisResult ? `${analysisResult.score}/100` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;