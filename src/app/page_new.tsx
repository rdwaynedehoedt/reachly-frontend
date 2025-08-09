"use client"

import Image from 'next/image'
import { 
  GoogleIcon, 
  MicrosoftIcon, 
  SparkleIcon, 
  EmailIcon, 
  LockIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from '@/components/icons'
import { InputField, SocialButton, PrimaryButton } from '@/components/ui'
import { useLoginForm } from '@/hooks/useLoginForm'

export default function Home() {
  const {
    formData,
    showPassword,
    handleInputChange,
    togglePasswordVisibility,
    handleSubmit,
    handleGoogleLogin,
    handleMicrosoftLogin
  } = useLoginForm()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo with Hover Effect */}
          <div className="text-center">
            <div className="inline-block hover:scale-105 transition-transform duration-300 cursor-pointer">
              <Image
                src="/logo with no background.png"
                alt="Reachly Logo"
                width={220}
                height={88}
                priority
                className="mx-auto drop-shadow-lg"
              />
            </div>
          </div>

          {/* Login Card with Glassmorphism */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <SparkleIcon />
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Welcome Back
                  </h2>
                  <SparkleIcon />
                </div>
                <p className="text-gray-600 font-medium">Sign in to your account</p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <SocialButton
                  icon={<GoogleIcon />}
                  text="Continue with Google"
                  onClick={handleGoogleLogin}
                />
                <SocialButton
                  icon={<MicrosoftIcon />}
                  text="Continue with Microsoft"
                  onClick={handleMicrosoftLogin}
                />
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-gray-500 font-medium">or continue with email</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  icon={<EmailIcon className="h-5 w-5 text-gray-400" />}
                  required
                />

                <div className="relative">
                  <InputField
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    icon={<LockIcon className="h-5 w-5 text-gray-400" />}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-white/20 rounded-r-lg transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 text-blue-600 bg-white/80 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="remember" className="text-gray-700 select-none cursor-pointer font-medium">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <PrimaryButton type="submit">
                  Sign In
                </PrimaryButton>
              </form>

              {/* Sign Up Link */}
              <p className="mt-8 text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">
                  Sign up now
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Protected by industry-standard encryption
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
