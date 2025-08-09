import { useState, FormEvent } from 'react'

interface LoginFormData {
  email: string
  password: string
}

interface UseLoginFormReturn {
  formData: LoginFormData
  showPassword: boolean
  handleInputChange: (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void
  togglePasswordVisibility: () => void
  handleSubmit: (e: FormEvent) => void
  handleGoogleLogin: () => void
  handleMicrosoftLogin: () => void
}

export const useLoginForm = (): UseLoginFormReturn => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('Login form submitted:', formData)
    // Add authentication logic here
  }

  const handleGoogleLogin = () => {
    console.log('Google login clicked')
    // Add Google OAuth logic here
  }

  const handleMicrosoftLogin = () => {
    console.log('Microsoft login clicked')
    // Add Microsoft OAuth logic here
  }

  return {
    formData,
    showPassword,
    handleInputChange,
    togglePasswordVisibility,
    handleSubmit,
    handleGoogleLogin,
    handleMicrosoftLogin
  }
}
