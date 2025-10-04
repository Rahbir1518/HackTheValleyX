import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  Baby, Mic, RefreshCw, Volume2, CheckCircle,
  Settings, User, Play, Pause, Loader, TrendingUp, BookOpen,
  Trophy, Star, Zap, Target, Award, Flame, Gift, Crown, Medal,
  Sparkles
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

// Age-based prompt configurations
const AGE_PROMPTS = {
  '0': {
    prompt: 'Generate a single simple vowel sound or babbling sound appropriate for a 0-year-old baby, such as "aaa", "ooo", "eee", "mmm", "baba", "dada". Return ONLY the sound, nothing else. Keep it 1-3 syllables maximum.',
    examples: ['aaa', 'ooo', 'mmm', 'baba', 'mama', 'dada'],
    description: 'Simple sounds & babbling'
  },
  '1': {
    prompt: 'Generate a single simple word or repeated syllable appropriate for a 1-year-old child, such as "ball", "mama", "dada", "cup", "dog", "cat", "more", "up". Return ONLY the word, nothing else. Maximum 2 syllables.',
    examples: ['ball', 'mama', 'more', 'dog', 'cup', 'milk'],
    description: 'First words'
  },
  '2-3': {
    prompt: 'Generate a simple 2-4 word phrase appropriate for a 2-3 year old child, such as "want milk", "play ball", "big dog", "go outside", "my toy". Use simple, common words. Return ONLY the phrase, nothing else.',
    examples: ['want milk', 'play ball', 'big truck', 'go park', 'my toy', 'red car'],
    description: 'Short phrases'
  },
  '4-6': {
    prompt: 'Generate a simple, clear sentence 6-12 words long appropriate for a 4-6 year old child to practice pronunciation. The sentence should use common words, proper grammar, and be easy to understand. Topics can include daily activities, animals, toys, family, or nature. Return ONLY the sentence, nothing else.',
    examples: [
      'I like to play with my friends at the park.',
      'The big brown dog runs fast in the yard.',
      'My favorite color is blue like the sky.',
      'We eat breakfast together every morning.'
    ],
    description: 'Complete sentences'
  }
} as const;

type AgeCategory = keyof typeof AGE_PROMPTS;

const getAgeCategory = (age: string | undefined): AgeCategory => {
  if (!age) return '4-6';
  if (age in AGE_PROMPTS) return age as AgeCategory;
  return '4-6';
};

interface AnalysisResult {
  score: number;
  feedback: string[];
  strengths: string[];
  improvements: string[];
  clarity: number;
  pronunciation: number;
  fluency: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface GameState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalPoints: number;
  streak: number;
  perfectScores: number;
  totalPractices: number;
  achievements: Achievement[];
}

const Learning = () => {
  const { user } = useUser();
  const [currentSentence, setCurrentSentence] = useState<string>('Click "Generate Sentence" to start practicing!');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);

  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalPoints: 0,
    streak: 0,
    perfectScores: 0,
    totalPractices: 0,
    achievements: [
      {
        id: 'first_practice',
        title: 'First Steps',
        description: 'Complete your first practice session',
        icon: Star,
        unlocked: false,
        progress: 0,
        target: 1
      },
      {
        id: 'streak_3',
        title: 'On Fire',
        description: 'Maintain a 3-session streak',
        icon: Flame,
        unlocked: false,
        progress: 0,
        target: 3
      },
      {
        id: 'perfect_score',
        title: 'Perfectionist',
        description: 'Achieve a perfect 100 score',
        icon: Crown,
        unlocked: false,
        progress: 0,
        target: 1
      },
      {
        id: 'practice_10',
        title: 'Dedicated Learner',
        description: 'Complete 10 practice sessions',
        icon: Medal,
        unlocked: false,
        progress: 0,
        target: 10
      },
      {
        id: 'high_scorer',
        title: 'High Achiever',
        description: 'Score above 90 five times',
        icon: Trophy,
        unlocked: false,
        progress: 0,
        target: 5
      }
    ]
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          const errorText = await response.text();
          throw new Error(`API call failed with status ${response.status}: ${errorText}`);
        }
      } catch (error) {
        if (i === maxRetries - 1) throw error;
      }
    }
    throw new Error("Failed to call API after multiple retries.");
  };

  const calculatePoints = (score: number): number => {
    let points = score;
    
    if (score >= 90) points += 50;
    else if (score >= 80) points += 25;
    else if (score >= 70) points += 10;
    
    points *= comboMultiplier;
    
    return Math.floor(points);
  };

  const addXP = (xp: number) => {
    setGameState(prev => {
      const newXP = prev.xp + xp;
      const newLevel = Math.floor(newXP / prev.xpToNextLevel) + prev.level;
      const leveledUp = newLevel > prev.level;
      
      if (leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
      
      return {
        ...prev,
        xp: newXP % prev.xpToNextLevel,
        level: newLevel,
        totalPoints: prev.totalPoints + xp
      };
    });
  };

  const checkAchievements = (score: number) => {
    setGameState(prev => {
      const updated = { ...prev };
      let unlockedNew = false;
      
      updated.achievements = prev.achievements.map(achievement => {
        if (achievement.unlocked) return achievement;
        
        let newProgress = achievement.progress;
        
        switch (achievement.id) {
          case 'first_practice':
            newProgress = Math.min(1, prev.totalPractices + 1);
            break;
          case 'perfect_score':
            if (score === 100) newProgress = 1;
            break;
          case 'practice_10':
            newProgress = Math.min(10, prev.totalPractices + 1);
            break;
          case 'high_scorer':
            if (score >= 90) newProgress = achievement.progress + 1;
            break;
          case 'streak_3':
            newProgress = Math.min(3, prev.streak);
            break;
        }
        
        const unlocked = newProgress >= achievement.target;
        if (unlocked && !achievement.unlocked && !unlockedNew) {
          setNewAchievement({ ...achievement, unlocked: true, progress: newProgress });
          setTimeout(() => setNewAchievement(null), 4000);
          unlockedNew = true;
        }
        
        return { ...achievement, progress: newProgress, unlocked };
      });
      
      return updated;
    });
  };

  const updateGameState = (score: number) => {
    const points = calculatePoints(score);
    setEarnedPoints(points);
    
    if (score >= 80) {
      setComboMultiplier(prev => Math.min(prev + 0.5, 3));
    } else {
      setComboMultiplier(1);
    }
    
    addXP(points);
    
    setGameState(prev => ({
      ...prev,
      totalPractices: prev.totalPractices + 1,
      perfectScores: score === 100 ? prev.perfectScores + 1 : prev.perfectScores,
      streak: score >= 70 ? prev.streak + 1 : 0
    }));
    
    checkAchievements(score);
    
    setTimeout(() => setEarnedPoints(0), 2000);
  };

  const generateSentence = async () => {
    setIsGenerating(true);
    setAnalysisResult(null);
    setRecordedAudio(null);

    const childAge = user?.unsafeMetadata?.childAge as string | undefined;
    const ageCategory = getAgeCategory(childAge);
    const ageConfig = AGE_PROMPTS[ageCategory];

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{
          text: ageConfig.prompt
        }]
      }]
    };

    try {
      const data = await callApiWithBackoff(apiUrl, payload);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const sentence = data.candidates[0].content.parts[0].text.trim().replace(/^['"]|['"]$/g, '');
        setCurrentSentence(sentence);
      } else {
        const randomExample = ageConfig.examples[Math.floor(Math.random() * ageConfig.examples.length)];
        setCurrentSentence(randomExample);
      }
    } catch (error) {
      console.error('Error generating sentence:', error);
      const randomExample = ageConfig.examples[Math.floor(Math.random() * ageConfig.examples.length)];
      setCurrentSentence(randomExample);
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      visualizeAudio();

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);

        stream.getTracks().forEach(track => track.stop());
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAnalysisResult(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
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
        
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
          const result = JSON.parse(responseText);
          setAnalysisResult(result);
          updateGameState(result.score);
        } catch (parseError) {
          console.error('Failed to parse AI response JSON:', parseError);
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

  // Age indicator component
  const AgeIndicator = () => {
    const childAge = user?.unsafeMetadata?.childAge as string | undefined;
    const childName = user?.unsafeMetadata?.childName as string | undefined;
    
    if (!childAge) return null;
    
    const ageCategory = getAgeCategory(childAge);
    const ageConfig = AGE_PROMPTS[ageCategory];

    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <Baby className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-purple-900 font-semibold">
              {childName ? `${childName}'s` : 'Child'} Practice Level
            </p>
            <p className="text-xs text-purple-700">
              {ageConfig.description} • Age {childAge}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E0D8] to-[#E5D2B8] font-inter relative overflow-hidden">
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
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(128, 150, 113, 0.3); }
            50% { box-shadow: 0 0 40px rgba(128, 150, 113, 0.6); }
          }
          @keyframes slideInUp {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slideInUp {
            animation: slideInUp 0.5s ease-out;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}
      </style>

      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-slideInUp bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-12 py-8 rounded-3xl shadow-2xl border-4 border-yellow-300">
            <div className="text-center">
              <Crown className="w-20 h-20 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-black mb-2">LEVEL UP!</h2>
              <p className="text-2xl font-bold">Level {gameState.level}</p>
              <Sparkles className="w-8 h-8 mx-auto mt-4 animate-spin" />
            </div>
          </div>
        </div>
      )}

      {newAchievement && (
        <div className="fixed top-24 right-6 z-50 animate-slideInUp">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-purple-300 max-w-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <newAchievement.icon className="w-10 h-10" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Achievement Unlocked!</p>
                <h3 className="font-bold text-lg">{newAchievement.title}</h3>
                <p className="text-xs opacity-90">{newAchievement.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {earnedPoints > 0 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="animate-slideInUp">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-4">
              <Zap className="w-12 h-12 animate-bounce" />
              <div>
                <p className="text-sm font-semibold">Points Earned!</p>
                <p className="text-4xl font-black">+{earnedPoints}</p>
                {comboMultiplier > 1 && (
                  <p className="text-sm mt-1">🔥 {comboMultiplier}x Combo!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-[#725C3A]/95 backdrop-blur-sm border-b border-[#D2AB80]/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 hover:cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-xl flex items-center justify-center shadow-md">
                    <Baby className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Mimicoo Learning</h1>
                    <p className="text-xs text-[#E5D2B8]">Speech practice & improvement</p>
                  </div>
              </button>
              
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-white font-bold">{gameState.streak}</span>
                <span className="text-white/70 text-sm">Streak</span>
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold">{gameState.totalPoints}</span>
                <span className="text-white/70 text-sm">Points</span>
              </div>

              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:cursor-pointer">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:cursor-pointer">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white/10 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500 relative"
              style={{ width: `${(gameState.xp / gameState.xpToNextLevel) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-white/70 text-xs">Level {gameState.level}</span>
            <span className="text-white/70 text-xs">{gameState.xp}/{gameState.xpToNextLevel} XP</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-3xl mb-4 shadow-lg animate-float">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-[#725C3A]">Speech Practice Arena</h2>
          <p className="text-[#725C3A]/80">Complete challenges, earn points, and level up your speaking skills!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AgeIndicator />
            
            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#809671]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#725C3A]">Practice Challenge</h3>
                    <p className="text-sm text-[#725C3A]/70">Read this sentence clearly</p>
                  </div>
                </div>
                <button
                  onClick={generateSentence}
                  disabled={isGenerating || isRecording || isAnalyzing}
                  className="px-4 py-2 bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:cursor-pointer"
                >
                  {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isGenerating ? 'Generating...' : 'New Challenge'}
                </button>
              </div>

              <div className="bg-gradient-to-r from-[#809671]/10 to-[#B3B792]/10 border-l-4 border-[#809671] rounded-lg p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10">
                  <Volume2 className="w-32 h-32 text-[#809671]" />
                </div>
                <p className="text-xl text-[#725C3A] leading-relaxed font-medium relative z-10">
                  "{currentSentence}"
                </p>
              </div>

              <div className="bg-[#725C3A]/10 rounded-xl p-6 mb-6 flex items-center justify-center relative overflow-hidden border border-[#D2AB80]/20 min-h-[200px]">
                {isRecording ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#809671]/10 to-[#B3B792]/10"></div>
                    <div className="relative z-10 text-center w-full">
                      <div className="relative inline-block">
                        <Mic className="w-16 h-16 mx-auto mb-4 text-[#809671] animate-pulse" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <p className="text-lg font-medium text-[#725C3A]">Recording in Progress...</p>
                      <p className="text-sm text-[#725C3A]/70 mt-2">Time: {formatTime(recordingTime)}</p>
                      
                      <div className="mt-6 flex items-center justify-center gap-1 h-16">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className={`visualizer-bar ${
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
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-[#809671] animate-bounce" />
                    <p className="text-lg font-medium text-[#725C3A]">Recording Complete!</p>
                    <p className="text-sm text-[#725C3A]/70 mt-2">Click "Analyze Recording" to get feedback and earn points</p>
                    <audio controls className="mt-4 w-full max-w-sm mx-auto rounded-xl">
                      <source src={URL.createObjectURL(recordedAudio)} type={recordedAudio.type} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <div className="text-center">
                    <Mic className="w-16 h-16 mx-auto mb-4 text-[#725C3A]/40" />
                    <p className="text-[#725C3A]/60">Ready to Record</p>
                    <p className="text-sm text-[#725C3A]/50 mt-2">Click Start Recording to begin your challenge</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isRecording && !recordedAudio && (
                  <button
                    onClick={startRecording}
                    disabled={isGenerating || isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow hover:cursor-pointer"
                  >
                    <Play className="w-5 h-5" />
                    Start Recording
                  </button>
                )}
                
                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:cursor-pointer"
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
                      className="flex-1 bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                    >
                      {isAnalyzing ? <Loader className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze & Earn Points'}
                    </button>
                    <button
                      onClick={() => {
                        setRecordedAudio(null);
                        setAnalysisResult(null);
                      }}
                      disabled={isAnalyzing}
                      className="px-6 py-3 bg-[#D2AB80]/30 hover:bg-[#D2AB80]/40 border border-[#D2AB80]/50 text-[#725C3A] rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>

            {analysisResult && (
              <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md animate-slideInUp">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-[#809671]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#725C3A]">Performance Report</h3>
                      <p className="text-sm text-[#725C3A]/70">AI-powered feedback & scoring</p>
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gradient-to-br from-[#809671]/10 to-[#B3B792]/10 border-2 border-[#809671]/30">
                    <p className="text-xs text-[#725C3A]/70 mb-1">Overall Score</p>
                    <p className={`text-4xl font-black ${getScoreColor(analysisResult.score)}`}>
                      {analysisResult.score}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < Math.floor(analysisResult.score / 20) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-blue-700">Clarity</p>
                      <Sparkles className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className={`text-3xl font-black ${getScoreColor(analysisResult.clarity)}`}>
                      {analysisResult.clarity}
                    </p>
                    <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getScoreBg(analysisResult.clarity)} transition-all duration-500`}
                        style={{ width: `${analysisResult.clarity}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-purple-700">Pronunciation</p>
                      <Volume2 className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className={`text-3xl font-black ${getScoreColor(analysisResult.pronunciation)}`}>
                      {analysisResult.pronunciation}
                    </p>
                    <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getScoreBg(analysisResult.pronunciation)} transition-all duration-500`}
                        style={{ width: `${analysisResult.pronunciation}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-green-700">Fluency</p>
                      <Zap className="w-4 h-4 text-green-500" />
                    </div>
                    <p className={`text-3xl font-black ${getScoreColor(analysisResult.fluency)}`}>
                      {analysisResult.fluency}
                    </p>
                    <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${getScoreBg(analysisResult.fluency)} transition-all duration-500`}
                        style={{ width: `${analysisResult.fluency}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-[#809671]/10 to-[#B3B792]/10 border-l-4 border-[#809671] rounded-lg p-4">
                    <h4 className="font-semibold text-[#809671] mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Your Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-[#725C3A] flex items-start gap-3 bg-white/50 p-3 rounded-lg">
                          <div className="w-6 h-6 bg-[#809671] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            ✓
                          </div>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Growth Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm text-[#725C3A] flex items-start gap-3 bg-white/50 p-3 rounded-lg">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </div>
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
            <div className="bg-gradient-to-br from-[#809671] to-[#B3B792] text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Player Stats</h3>
                  <p className="text-xs opacity-80">Level {gameState.level} Speaker</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Total Points
                    </span>
                    <span className="text-2xl font-black">{gameState.totalPoints}</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-300" />
                      Current Streak
                    </span>
                    <span className="text-2xl font-black">{gameState.streak}</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-300" />
                      Perfect Scores
                    </span>
                    <span className="text-2xl font-black">{gameState.perfectScores}</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Sessions Completed
                    </span>
                    <span className="text-2xl font-black">{gameState.totalPractices}</span>
                  </div>
                </div>

                {comboMultiplier > 1 && (
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold flex items-center gap-2">
                        <Flame className="w-5 h-5" />
                        Combo Multiplier
                      </span>
                      <span className="text-3xl font-black">{comboMultiplier}x</span>
                    </div>
                    <p className="text-xs mt-1 opacity-90">Keep scoring 80+ to maintain!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#725C3A]">Achievements</h3>
                  <p className="text-xs text-[#725C3A]/70">
                    {gameState.achievements.filter(a => a.unlocked).length}/{gameState.achievements.length} Unlocked
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {gameState.achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        achievement.unlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-300'
                      }`}>
                        <achievement.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-[#725C3A]">{achievement.title}</h4>
                        <p className="text-xs text-[#725C3A]/70">{achievement.description}</p>
                        {!achievement.unlocked && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-[#809671] to-[#B3B792] h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-[#725C3A]/60 mt-1">
                              {achievement.progress}/{achievement.target}
                            </p>
                          </div>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-[#D2AB80]/30 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#809671]/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#809671]" />
                </div>
                <h3 className="font-semibold text-[#725C3A]">Detailed Feedback</h3>
              </div>

              {analysisResult ? (
                <div className="space-y-3">
                  {analysisResult.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#809671]/5 to-[#B3B792]/5 rounded-lg border border-[#809671]/20">
                      <div className="w-7 h-7 bg-gradient-to-br from-[#809671] to-[#B3B792] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-[#725C3A] flex-1">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 mx-auto mb-3 text-[#725C3A]/30" />
                  <p className="text-sm text-[#725C3A]/60">
                    Complete a challenge to receive personalized feedback and unlock rewards!
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-md">
              <h3 className="font-semibold mb-4 text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Pro Tips for Maximum Points
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm text-gray-700">Score 80+ to build your combo multiplier</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm text-gray-700">Practice daily to maintain your streak bonus</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm text-gray-700">Find a quiet space for better recording quality</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    4
                  </div>
                  <p className="text-sm text-gray-700">Perfect scores unlock special achievements</p>
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