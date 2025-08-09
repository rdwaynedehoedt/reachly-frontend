import { FormEvent, HTMLInputTypeAttribute } from 'react'

interface InputFieldProps {
  type: HTMLInputTypeAttribute
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon?: React.ReactNode
  required?: boolean
  className?: string
}

export const InputField = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  icon, 
  required = false,
  className = ""
}: InputFieldProps) => (
  <div className={`relative group ${className}`}>
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full pl-10 pr-3 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:bg-white/15"
    />
  </div>
)

interface SocialButtonProps {
  icon: React.ReactNode
  text: string
  onClick: () => void
  className?: string
}

export const SocialButton = ({ 
  icon, 
  text, 
  onClick, 
  className = "" 
}: SocialButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
    {icon}
    <span className="font-medium">{text}</span>
  </button>
)

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: (e: FormEvent) => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  className?: string
}

export const PrimaryButton = ({ 
  children, 
  onClick, 
  type = "button", 
  disabled = false,
  className = ""
}: PrimaryButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`group relative w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
    <span className="relative z-10">{children}</span>
  </button>
)
