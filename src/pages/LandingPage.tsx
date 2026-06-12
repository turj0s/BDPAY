import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  BarChart3,
  Webhook,
  Lock,
  ShoppingBag
} from 'lucide-react'
import GradientMesh from '../components/GradientMesh'

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-hairline">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-light text-primary" style={{ letterSpacing: '-0.5px' }}>BDPay</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="body-md text-ink-mute hover:text-ink transition-colors">Features</a>
              <a href="#pricing" className="body-md text-ink-mute hover:text-ink transition-colors">Pricing</a>
              <a href="#docs" className="body-md text-ink-mute hover:text-ink transition-colors">Docs</a>
              <a href="#blog" className="body-md text-ink-mute hover:text-ink transition-colors">Blog</a>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/login" className="body-md text-ink-mute hover:text-primary transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="button-primary">
                Start for free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <GradientMesh />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center pt-20 pb-32">
            <div className="mb-6">
              <span className="pill-tag-soft">FREE FOREVER</span>
            </div>
            
            <h1 className="display-xxl mb-6">
              The payment infrastructure Bangladesh's merchants needed.
            </h1>
            
            <p className="body-lg text-ink-mute max-w-2xl mx-auto mb-8">
              Accept bKash, Nagad, Rocket & Upay — zero merchant API fees, zero monthly costs. Built for Bangladesh.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/register" className="button-primary text-base px-6 py-3">
                Start for free <ArrowRight size={18} />
              </Link>
              <button className="button-secondary text-base px-6 py-3">
                See how it works
              </button>
            </div>
            
            {/* Dashboard Mockup */}
            <div className="card-dashboard max-w-5xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-hairline">
                      <th className="caption text-left py-3 px-4">TRX ID</th>
                      <th className="caption text-left py-3 px-4">Provider</th>
                      <th className="caption text-right py-3 px-4">Amount</th>
                      <th className="caption text-left py-3 px-4">Customer</th>
                      <th className="caption text-right py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-hairline">
                      <td className="body-tabular py-4 px-4">BK240101ABC</td>
                      <td className="py-4 px-4">
                        <span className="pill-tag-soft provider-bkash">bKash</span>
                      </td>
                      <td className="body-tabular text-right py-4 px-4">৳1,500.00</td>
                      <td className="body-md py-4 px-4">Karim Rahman</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button className="button-primary text-xs px-3 py-1.5">✓ Approve</button>
                          <button className="button-secondary text-xs px-3 py-1.5">✗ Reject</button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-hairline">
                      <td className="body-tabular py-4 px-4">NG240102XYZ</td>
                      <td className="py-4 px-4">
                        <span className="pill-tag-soft provider-nagad">Nagad</span>
                      </td>
                      <td className="body-tabular text-right py-4 px-4">৳2,300.00</td>
                      <td className="body-md py-4 px-4">Fatima Begum</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button className="button-primary text-xs px-3 py-1.5">✓ Approve</button>
                          <button className="button-secondary text-xs px-3 py-1.5">✗ Reject</button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="body-tabular py-4 px-4">RK240103DEF</td>
                      <td className="py-4 px-4">
                        <span className="pill-tag-soft provider-rocket">Rocket</span>
                      </td>
                      <td className="body-tabular text-right py-4 px-4">৳850.00</td>
                      <td className="body-md py-4 px-4">Ahmed Ali</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button className="button-primary text-xs px-3 py-1.5">✓ Approve</button>
                          <button className="button-secondary text-xs px-3 py-1.5">✗ Reject</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Strip */}
      <section className="bg-canvas-soft py-12 border-y border-hairline">
        <div className="container mx-auto px-6">
          <p className="body-md text-ink-mute text-center mb-8">Trusted by merchants using</p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div className="pill-tag-soft provider-bkash text-base px-6 py-3">bKash</div>
            <div className="pill-tag-soft provider-nagad text-base px-6 py-3">Nagad</div>
            <div className="pill-tag-soft provider-rocket text-base px-6 py-3">Rocket</div>
            <div className="pill-tag-soft provider-upay text-base px-6 py-3">Upay</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="section-padding bg-canvas-soft">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="micro-cap text-ink-mute mb-4">HOW IT WORKS</p>
            <h2 className="display-lg">Simple verification. Real orders.</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card-feature text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="heading-md text-primary">1</span>
              </div>
              <h3 className="heading-md mb-3">Customer sends money</h3>
              <p className="body-md text-ink-mute">
                Customer opens their bKash, Nagad, Rocket, or Upay app and sends money to your wallet number.
              </p>
            </div>
            
            <div className="card-feature text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="heading-md text-primary">2</span>
              </div>
              <h3 className="heading-md mb-3">Customer enters TrxID</h3>
              <p className="body-md text-ink-mute">
                At your checkout, customer enters their Transaction ID from the payment confirmation.
              </p>
            </div>
            
            <div className="card-feature text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="heading-md text-primary">3</span>
              </div>
              <h3 className="heading-md mb-3">You verify & ship</h3>
              <p className="body-md text-ink-mute">
                You verify the payment in your dashboard, approve it, and ship the order. That's it!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="section-padding bg-canvas">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="card-feature">
              <div className="text-primary mb-4">
                <Webhook size={32} />
              </div>
              <h3 className="heading-md mb-3">API & Webhooks</h3>
              <p className="body-md text-ink-mute">
                REST API with webhook notifications. Integrate payments into your existing system in minutes.
              </p>
            </div>
            
            <div className="card-feature">
              <div className="text-primary mb-4">
                <Shield size={32} />
              </div>
              <h3 className="heading-md mb-3">Fraud Prevention</h3>
              <p className="body-md text-ink-mute">
                Automatic duplicate TrxID detection and blocked list to protect your business.
              </p>
            </div>
            
            <div className="card-feature">
              <div className="text-primary mb-4">
                <ShoppingBag size={32} />
              </div>
              <h3 className="heading-md mb-3">WooCommerce Plugin</h3>
              <p className="body-md text-ink-mute">
                One-click WordPress integration. Start accepting payments on your WooCommerce store today.
              </p>
            </div>
            
            <div className="card-feature">
              <div className="text-primary mb-4">
                <Globe size={32} />
              </div>
              <h3 className="heading-md mb-3">Hosted Checkout</h3>
              <p className="body-md text-ink-mute">
                Create shareable payment links. No website? No problem. Share a link and get paid.
              </p>
            </div>
            
            <div className="card-feature">
              <div className="text-primary mb-4">
                <Users size={32} />
              </div>
              <h3 className="heading-md mb-3">Multi-Staff Access</h3>
              <p className="body-md text-ink-mute">
                Team management with role-based permissions. Your staff can help verify payments.
              </p>
            </div>
            
            <div className="card-feature">
              <div className="text-primary mb-4">
                <BarChart3 size={32} />
              </div>
              <h3 className="heading-md mb-3">Analytics</h3>
              <p className="body-md text-ink-mute">
                Daily volume, approval rates, CSV exports. Understand your payment patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bangla Section */}
      <section className="section-padding" style={{ background: 'var(--color-canvas-cream)' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="display-lg mb-4">বাংলায় ব্যবহার করুন</h2>
            <p className="body-lg text-ink-mute mb-8">
              Also available in Bangla
            </p>
            <div className="card-feature">
              <p className="body-md text-ink-mute">
                Full Bangla language support for the entire dashboard. Switch between English and বাংলা with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding bg-canvas">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="micro-cap text-ink-mute mb-4">PRICING</p>
            <h2 className="display-lg">Always free. No surprises.</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="card-feature">
              <h3 className="heading-lg mb-2">Free</h3>
              <div className="mb-6">
                <span className="display-lg tabular">৳0</span>
                <span className="body-md text-ink-mute">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Unlimited transactions</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>2 wallets</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>1 staff member</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Hosted checkout</span>
                </li>
              </ul>
              <Link to="/register" className="button-secondary w-full justify-center">
                Get started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="card-dark relative">
              <div className="absolute -top-3 right-6">
                <span className="pill-tag-soft">POPULAR</span>
              </div>
              <h3 className="heading-lg mb-2">Pro</h3>
              <div className="mb-6">
                <span className="display-lg tabular">৳499</span>
                <span className="body-md opacity-70">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span>Everything in Free, plus:</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span>Unlimited wallets</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span>10 staff members</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span>WooCommerce plugin</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span>Webhook logs</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-white flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <Link to="/register" className="button-primary w-full justify-center bg-white text-primary hover:bg-gray-100">
                Start Pro trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="card-feature">
              <h3 className="heading-lg mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="display-lg">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Everything in Pro, plus:</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>White-label branding</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-2 body-md">
                  <CheckCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <span>SLA guarantee</span>
                </li>
              </ul>
              <a href="mailto:enterprise@bdpay.app" className="button-secondary w-full justify-center">
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-canvas-soft border-t border-hairline py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="heading-md mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Features</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Pricing</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Integrations</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="heading-md mb-4">Developers</h4>
              <ul className="space-y-3">
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Documentation</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">API Reference</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Webhooks</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="heading-md mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">About</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Blog</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Careers</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="heading-md mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Privacy</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Terms</a></li>
                <li><a href="#" className="body-md text-ink-mute hover:text-ink transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-hairline pt-8">
            <p className="body-md text-ink-mute text-center">
              © 2025 BDPay. Made in Bangladesh 🇧🇩
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
