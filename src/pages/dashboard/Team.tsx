import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Mail, Shield, User, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Database } from '../../lib/database.types'

type Staff = Database['public']['Tables']['staff']['Row']

const Team = () => {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'staff' as 'admin' | 'staff',
  })

  useEffect(() => {
    fetchStaffMembers()
  }, [])

  const fetchStaffMembers = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!merchant) return
      setMerchantId(merchant.id)

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStaffMembers(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!merchantId) return

    try {
      setInviting(true)

      // Check if email already invited
      const { data: existing } = await supabase
        .from('staff')
        .select('id')
        .eq('merchant_id', merchantId)
        .eq('invited_email', inviteData.email)
        .single()

      if (existing) {
        alert('This email has already been invited')
        return
      }

      // In a real implementation, you would:
      // 1. Create a staff record with invited_email
      // 2. Send an invitation email with a link
      // 3. When they accept, update the user_id and accepted_at fields

      // For now, we'll create a pending invitation
      const { error } = await supabase.from('staff').insert({
        merchant_id: merchantId,
        // We'll set user_id to a placeholder UUID for pending invites
        user_id: '00000000-0000-0000-0000-000000000000',
        role: inviteData.role,
        invited_email: inviteData.email,
        accepted_at: null,
      })

      if (error) throw error

      alert(`Invitation sent to ${inviteData.email}! (In production, they would receive an email with a link to accept.)`)
      
      setShowInviteModal(false)
      setInviteData({ email: '', role: 'staff' })
      fetchStaffMembers()
    } catch (error: any) {
      alert(error.message || 'Error inviting staff member')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveStaff = async (staffId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email}?`)) return

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId)

      if (error) throw error
      fetchStaffMembers()
    } catch (error: any) {
      alert(error.message || 'Error removing staff member')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield size={18} className="text-primary" />
      case 'admin':
        return <Shield size={18} className="text-blue-500" />
      default:
        return <User size={18} className="text-ink-mute" />
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-primary/10 text-primary'
      case 'admin':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const isPending = (staff: Staff) => {
    return !staff.accepted_at && staff.invited_email
  }

  const isOwner = (staff: Staff) => {
    return staff.role === 'owner' || staff.user_id === currentUserId
  }

  const pendingInvites = staffMembers.filter(s => isPending(s))
  const activeMembers = staffMembers.filter(s => !isPending(s))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-lg mb-2">Team</h1>
          <p className="body-md text-ink-mute">Manage your team members and their permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="button-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Invite Staff
        </button>
      </div>

      {/* Active Team Members */}
      <div className="card-dashboard">
        <h2 className="heading-lg mb-4">Team Members</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="body-md text-ink-mute">Loading team...</p>
          </div>
        ) : activeMembers.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="text-primary-bg-subdued mx-auto mb-4" />
            <h3 className="heading-md mb-2">You're flying solo</h3>
            <p className="body-md text-ink-mute mb-6">
              Invite team members to help manage payments
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="button-primary mx-auto"
            >
              <Plus size={20} />
              Invite Staff
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="caption text-left py-3 px-4">Member</th>
                  <th className="caption text-left py-3 px-4">Email</th>
                  <th className="caption text-left py-3 px-4">Role</th>
                  <th className="caption text-left py-3 px-4">Joined</th>
                  <th className="caption text-right py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeMembers.map((member) => (
                  <tr key={member.id} className="border-b border-hairline hover:bg-canvas-soft transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(member.role)}
                        <span className="body-md">
                          {member.invited_email?.split('@')[0] || 'Team Member'}
                          {isOwner(member) && ' (You)'}
                        </span>
                      </div>
                    </td>
                    <td className="body-md py-4 px-4">
                      {member.invited_email || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`pill-tag-soft ${getRoleBadgeClass(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="body-md text-ink-mute py-4 px-4">
                      {member.accepted_at ? new Date(member.accepted_at).toLocaleDateString() : 
                       new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {!isOwner(member) && (
                        <button
                          onClick={() => handleRemoveStaff(member.id, member.invited_email || 'member')}
                          className="button-secondary text-red-600 hover:bg-red-50 px-3 py-1.5 text-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="card-dashboard">
          <h2 className="heading-lg mb-4">Pending Invitations</h2>
          
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 bg-canvas-soft rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-ink-mute" />
                  <div>
                    <p className="body-md">{invite.invited_email}</p>
                    <p className="caption text-ink-mute">
                      Invited {new Date(invite.created_at).toLocaleDateString()} • Role: {invite.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveStaff(invite.id, invite.invited_email || 'invite')}
                  className="button-secondary text-red-600 hover:bg-red-50"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Permissions Info */}
      <div className="card-feature">
        <h3 className="heading-md mb-4">Role Permissions</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Shield size={20} className="text-primary flex-shrink-0 mt-1" />
            <div>
              <p className="body-md font-medium mb-1">Owner</p>
              <p className="body-md text-ink-mute text-sm">
                Full access to all features including team management, settings, and billing
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Shield size={20} className="text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <p className="body-md font-medium mb-1">Admin</p>
              <p className="body-md text-ink-mute text-sm">
                Can manage transactions, wallets, checkout links, and view analytics. Cannot modify settings or team.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <User size={20} className="text-ink-mute flex-shrink-0 mt-1" />
            <div>
              <p className="body-md font-medium mb-1">Staff</p>
              <p className="body-md text-ink-mute text-sm">
                Can view and verify transactions only. Read-only access to other features.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <div className="bg-canvas rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-hairline">
                <div className="flex items-center justify-between">
                  <h2 className="heading-lg">Invite Team Member</h2>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-ink-mute hover:text-ink transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleInviteStaff} className="p-6 space-y-4">
                <div>
                  <label className="body-md block mb-2 text-ink-secondary">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="input"
                    placeholder="colleague@example.com"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    required
                  />
                  <p className="text-sm text-ink-mute mt-1">
                    They'll receive an invitation email to join your team
                  </p>
                </div>

                <div>
                  <label className="body-md block mb-2 text-ink-secondary">Role</label>
                  <select
                    className="input"
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as any })}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="bg-canvas-soft p-4 rounded-lg">
                  <p className="body-md text-ink-mute text-sm">
                    {inviteData.role === 'admin' 
                      ? 'Admins can manage transactions, wallets, and checkout links'
                      : 'Staff can view and verify transactions only'}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="button-secondary flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button-primary flex-1 justify-center"
                    disabled={inviting}
                  >
                    {inviting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Mail size={18} />
                        Send Invite
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Team
