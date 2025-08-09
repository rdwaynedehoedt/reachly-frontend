import { useState, FormEvent } from 'react'

interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  agreeToTerms: boolean
}

interface UseSignupFormReturn {
  formData: SignupFormData
  isLoading: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: FormEvent) => void
  handleGoogleSignup: () => void
  handleMicrosoftSignup: () => void
}

export const useSignupForm = (): UseSignupFormReturn => {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeToTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Signup form submitted:', formData)
      // Add API call here
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Handle success (redirect, show success message, etc.)
      
    } catch (error) {
      console.error('Signup error:', error)
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    console.log('Google signup clicked')
    // Add Google OAuth logic here
  }

  const handleMicrosoftSignup = () => {
    console.log('Microsoft signup clicked')
    // Add Microsoft OAuth logic here
  }

  return {
    formData,
    isLoading,
    handleInputChange,
    handleSubmit,
    handleGoogleSignup,
    handleMicrosoftSignup
  }
}
