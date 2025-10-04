import { SignIn } from '@clerk/clerk-react';
import { Baby } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E0D8] via-[#E5D2B8] to-[#D2AB80] flex items-center justify-center p-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#809671]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#B3B792]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#809671] to-[#B3B792] rounded-full flex items-center justify-center shadow-lg">
              <Baby className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-[#725C3A]">Mimicoo</span>
          </button>
          <p className="text-[#725C3A]/70 text-lg">Welcome back! Sign in to continue</p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-[#D2AB80]/30">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                headerTitle: "text-[#725C3A] font-bold",
                headerSubtitle: "text-[#725C3A]/70",
                socialButtonsBlockButton: "bg-white hover:bg-[#E5D2B8] border-[#D2AB80]/30 text-[#725C3A]",
                formButtonPrimary: "bg-gradient-to-r from-[#809671] to-[#B3B792] hover:from-[#B3B792] hover:to-[#809671] text-white shadow-lg",
                formFieldInput: "bg-white border-[#D2AB80]/30 text-[#725C3A] focus:border-[#809671]",
                footerActionLink: "text-[#809671] hover:text-[#B3B792]",
                identityPreviewText: "text-[#725C3A]",
                identityPreviewEditButton: "text-[#809671]",
                formFieldLabel: "text-[#725C3A]",
                dividerLine: "bg-[#D2AB80]/30",
                dividerText: "text-[#725C3A]/60",
              },
              variables: {
                colorPrimary: '#809671',
                colorBackground: 'transparent',
                colorInputBackground: '#ffffff',
                colorInputText: '#725C3A',
              }
            }}
            routing="path"
            path="/login"
            signUpUrl="/signup"
            afterSignInUrl="/dashboard"
          />
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#725C3A]/60">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/signup')}
              className="text-[#809671] font-semibold hover:text-[#B3B792] transition-colors"
            >
              Sign up free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}