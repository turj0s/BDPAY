import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.businessName,
        formData.phone || undefined
      )
      // Show success message
      setError(null)
      alert('Registration successful! Please check your email to verify your account.')
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-canvas-soft flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-light text-primary inline-block mb-2">BDPay</Link>
          <h1 className="display-md mb-2">Create your account</h1>
          <p className="body-md text-ink-mute">Start accepting payments in minutes</p>
        </div>
        
        <div className="card-feature">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md body-md">
                {error}
              </div>
            )}

            <div>
              <label className="body-md block mb-2 text-ink-secondary">Business Name</label>
              <input 
                type="text" 
                name="businessName"
                className="input"
                placeholder="Your Business Name"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="body-md block mb-2 text-ink-secondary">Email</label>
              <input 
                type="email"
                name="email"
                className="input"
                placeholder="you@business.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="body-md block mb-2 text-ink-secondary">Phone (Optional)</label>
              <input 
                type="tel"
                name="phone"
                className="input"
                placeholder="+880 1712345678"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="body-md block mb-2 text-ink-secondary">Password</label>
              <input 
                type="password"
                name="password"
                className="input"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="body-md block mb-2 text-ink-secondary">Confirm Password</label>
              <input 
                type="password"
                name="confirmPassword"
                className="input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <p className="body-md text-ink-mute text-sm">
              By registering you agree to our{' '}
              <a href="#" className="link-on-light">Terms of Service</a>
            </p>
            
            <button 
              type="submit" 
              className="button-primary w-full justify-center"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>
        </div>
        
        <p className="body-md text-ink-mute text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="link-on-light">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
