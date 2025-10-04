import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Baby, ArrowRight, Loader, Sparkles, Heart } from 'lucide-react';

export default function Onboarding() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [childName, setChildName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const ageCategories = [
    { 
      value: '0', 
      label: '0 years old', 
      description: 'Babbling & sounds',
      icon: '👶',
      color: 'from-pink-400 to-rose-400'
    },
    { 
      value: '1', 
      label: '1 year old', 
      description: 'First words',
      icon: '🍼',
      color: 'from-purple-400 to-pink-400'
    },
    { 
      value: '2-3', 
      label: '2-3 years old', 
      description: 'Short phrases',
      icon: '🧸',
      color: 'from-blue-400 to-purple-400'
    },
    { 
      value: '4-6', 
      label: '4-6 years old', 
      description: 'Full sentences',
      icon: '🎨',
      color: 'from-green-400 to-blue-400'
    }
  ];

  const handleSubmit = async () => {
    if (!selectedAge || !childName.trim()) {
      setError('Please provide your child\'s name and select an age category');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Save to Clerk user metadata
      await user?.update({
        unsafeMetadata: {
          childAge: selectedAge,
          childName: childName.trim(),
          onboardingCompleted: true,
          onboardingDate: new Date().toISOString()
        }
      });

      // Navigate to dashboard using React Router
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving child info:', err);
      setError('Failed to save information. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E0D8] via-[#E5D2B8] to-[#D2AB80] flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#809671]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#B3B792]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-full flex items-center justify-center shadow-lg">
              <Baby className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#725C3A] mb-2">Welcome to Mimicoo!</h1>
          <p className="text-[#725C3A]/70 text-lg flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Let's personalize your child's learning journey
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-[#D2AB80]/30">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-[#725C3A] font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#809671]" />
              What's your child's name?
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => {
                setChildName(e.target.value);
                setError('');
              }}
              placeholder="Enter your child's name"
              className="w-full px-4 py-3 bg-white border-2 border-[#D2AB80]/30 rounded-xl text-[#725C3A] focus:border-[#809671] focus:outline-none transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="mb-8">
            <label className="block text-[#725C3A] font-semibold mb-4 flex items-center gap-2">
              <Baby className="w-5 h-5 text-[#809671]" />
              Select your child's age
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ageCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedAge(category.value);
                    setError('');
                  }}
                  disabled={isLoading}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                    selectedAge === category.value
                      ? 'border-[#809671] bg-gradient-to-br from-[#809671]/10 to-[#B3B792]/10 shadow-lg scale-105'
                      : 'border-[#D2AB80]/30 bg-white hover:border-[#809671]/50 hover:shadow-md'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-3xl shadow-md`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#725C3A] mb-1">{category.label}</h3>
                      <p className="text-sm text-[#725C3A]/70">{category.description}</p>
                    </div>
                    {selectedAge === category.value && (
                      <div className="w-6 h-6 bg-[#809671] rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#809671]/10 to-[#B3B792]/10 border-l-4 border-[#809671] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#725C3A]">
              <strong>Why we ask:</strong> We'll customize speech exercises and difficulty levels perfectly suited for your child's developmental stage.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedAge || !childName.trim()}
            className="w-full bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#6d8060] hover:to-[#9da47d] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#725C3A]/60">
            You can update this information anytime in settings
          </p>
        </div>
      </div>
    </div>
  );
}