import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  return (
    <div className="min-h-screen bg-canvas-soft flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-light text-primary inline-block mb-2">BDPay</Link>
          <h1 className="display-md mb-2">Welcome back</h1>
          <p className="body-md text-ink-mute">Sign in to your account</p>
        </div>
        
        <div className="card-feature">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md body-md">
                {error}
              </div>
            )}

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
              <label className="body-md block mb-2 text-ink-secondary">Password</label>
              <input 
                type="password"
                name="password"
                className="input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 body-md text-ink-mute">
                <input 
                  type="checkbox"
                  name="rememberMe"
                  className="rounded"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                Remember me
              </label>
              <a href="#" className="body-md link-on-light">Forgot password?</a>
            </div>
            
            <button 
              type="submit" 
              className="button-primary w-full justify-center"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
        </div>
        
        <p className="body-md text-ink-mute text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="link-on-light">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
