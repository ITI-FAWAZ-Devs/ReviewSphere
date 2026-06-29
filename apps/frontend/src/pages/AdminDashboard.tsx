import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Layers,
  Search,
  Ban,
  CheckCircle,
  Plus,
  Trash2,
  LogOut,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStacks } from '@/hooks/useAuth';
import {
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserRole,
  useCreateStack,
  useDeleteStack,
} from '@/hooks/useAdmin';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'users' | 'stacks'>('users');
  
  // User moderation states
  const [userKeyword, setUserKeyword] = useState('');
  const [userPage, setUserPage] = useState(1);

  // Stacks states
  const [newStackName, setNewStackName] = useState('');
  const [newStackDesc, setNewStackDesc] = useState('');
  const [isStackModalOpen, setIsStackModalOpen] = useState(false);

  // Queries & Mutations
  const { data: userData, isLoading: loadingUsers, error: usersError } = useAdminUsers({
    page: userPage,
    limit: 10,
    keyword: userKeyword,
  });
  
  const { data: stacks = [], isLoading: loadingStacks } = useStacks();

  const updateUserStatusMutation = useUpdateUserStatus();
  const updateUserRoleMutation = useUpdateUserRole();
  const createStackMutation = useCreateStack();
  const deleteStackMutation = useDeleteStack();

  const SIDEBAR_LINKS = useMemo(() => [
    { id: 'users', label: 'User Moderation', icon: Users },
    { id: 'stacks', label: 'Tech Stacks', icon: Layers },
  ], []);

  const handleToggleBlock = (userId: string, currentStatus: 'ACTIVE' | 'BLOCKED') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const actionLabel = nextStatus === 'BLOCKED' ? 'blocked' : 'unblocked';

    updateUserStatusMutation.mutate(
      { id: userId, status: nextStatus },
      {
        onSuccess: () => {
          toast.success(`User successfully ${actionLabel}.`);
        },
        onError: (err) => {
          toast.error(err.message || 'Operation failed.');
        },
      }
    );
  };

  const handleRoleChange = (userId: string, newRole: 'STUDENT' | 'MENTOR' | 'ADMIN') => {
    updateUserRoleMutation.mutate(
      { id: userId, role: newRole },
      {
        onSuccess: () => {
          toast.success(`User role successfully updated to ${newRole}.`);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to update user role.');
        },
      }
    );
  };

  const handleCreateStackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStackName.trim()) {
      toast.error('Stack name is required');
      return;
    }

    createStackMutation.mutate(
      { name: newStackName, description: newStackDesc },
      {
        onSuccess: () => {
          toast.success('Tech stack created successfully.');
          setIsStackModalOpen(false);
          setNewStackName('');
          setNewStackDesc('');
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to create tech stack.');
        },
      }
    );
  };

  const handleDeleteStack = (stackId: string) => {
    if (!window.confirm('Are you sure you want to delete this stack? Mentors registered under this stack will remain, but you cannot assign new mentors to it.')) {
      return;
    }

    deleteStackMutation.mutate(stackId, {
      onSuccess: () => {
        toast.success('Tech stack deleted successfully.');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to delete tech stack.');
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-e border-border bg-card min-h-[calc(100vh-3.5rem)]">
          <div className="flex-1 py-6 px-4 space-y-7">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
                Admin Control Panel
              </p>
              <nav className="space-y-1">
                {SIDEBAR_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => setActiveTab(link.id as any)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                        isActive
                          ? 'bg-rs-accent/15 text-rs-accent font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="p-4 border-t border-border">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-muted-foreground hover:text-rs-danger hover:bg-rs-danger/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('dashboard.sidebar.logout')}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-background">
          {/* Header */}
          <header className="border-b border-border bg-card/45 backdrop-blur-md px-6 md:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Admin Control Room
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeTab === 'users'
                  ? 'Approve/block registered students and mentors.'
                  : 'Manage available technological stacks in Discovery page.'}
              </p>
            </div>
            {activeTab === 'stacks' && (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setIsStackModalOpen(true)}
                  className="rounded-xl flex items-center gap-2 bg-rs-accent hover:bg-rs-accent-hover text-white font-semibold"
                >
                  <Plus className="w-4 h-4" /> Add Tech Stack
                </Button>
              </div>
            )}
          </header>

          <div className="px-6 md:px-8 py-6 md:py-8">
            {/* ── Users Panel ────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center max-w-sm gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-xs">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    value={userKeyword}
                    onChange={(e) => {
                      setUserKeyword(e.target.value);
                      setUserPage(1); // Reset page on query
                    }}
                    placeholder="Search by name or email..."
                    className="w-full bg-transparent border-0 text-sm focus:outline-none focus:ring-0 text-foreground placeholder-muted-foreground"
                  />
                </div>

                {usersError && (
                  <div className="p-4 bg-rs-danger/10 border border-rs-danger/30 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rs-danger flex-shrink-0" />
                    <p className="text-rs-danger text-sm">{usersError.message}</p>
                  </div>
                )}

                {loadingUsers ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-rs-accent" />
                  </div>
                ) : !userData || userData.data.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No users registered yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-start">
                              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">User</th>
                              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">Role</th>
                              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">Status</th>
                              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">Created</th>
                              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-start">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {userData.data.map((user) => (
                              <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                                <td className="px-5 py-4">
                                  <div>
                                    <p className="font-semibold text-foreground">{user.name || 'No Profile'}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                                    {user.title && <p className="text-xs text-rs-accent font-semibold">{user.title}</p>}
                                  </div>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                    disabled={updateUserRoleMutation.isPending && updateUserRoleMutation.variables?.id === user.id}
                                    className={`px-2 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-rs-accent/30 ${
                                      user.role === 'ADMIN'
                                        ? 'bg-rs-accent/10 text-rs-accent border-rs-accent/20'
                                        : user.role === 'MENTOR'
                                        ? 'bg-rs-success/10 text-rs-success border-rs-success/20'
                                        : 'bg-muted text-muted-foreground border-border'
                                    }`}
                                  >
                                    <option value="STUDENT">STUDENT</option>
                                    <option value="MENTOR">MENTOR</option>
                                    <option value="ADMIN">ADMIN</option>
                                  </select>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                    user.status === 'ACTIVE'
                                      ? 'bg-rs-success/10 text-rs-success border-rs-success/20'
                                      : 'bg-rs-danger/10 text-rs-danger border-rs-danger/20'
                                  }`}>
                                    {user.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap font-mono">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                  {user.role !== 'ADMIN' && (
                                    <button
                                      onClick={() => handleToggleBlock(user.id, user.status)}
                                      disabled={updateUserStatusMutation.isPending && updateUserStatusMutation.variables?.id === user.id}
                                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                                        user.status === 'ACTIVE'
                                          ? 'border-rs-danger/30 text-rs-danger bg-rs-danger/5 hover:bg-rs-danger/10'
                                          : 'border-rs-success/30 text-rs-success bg-rs-success/5 hover:bg-rs-success/10'
                                      }`}
                                    >
                                      {user.status === 'ACTIVE' ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                      {user.status === 'ACTIVE' ? 'Block User' : 'Unblock User'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination */}
                    {userData.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                        <p className="text-xs text-muted-foreground">
                          Showing page <strong>{userData.pagination.currentPage}</strong> of <strong>{userData.pagination.totalPages}</strong>
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={userPage <= 1}
                            onClick={() => setUserPage((p) => p - 1)}
                            className="rounded-lg text-xs"
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={userPage >= userData.pagination.totalPages}
                            onClick={() => setUserPage((p) => p + 1)}
                            className="rounded-lg text-xs"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Stacks Panel ───────────────────────────────────────────── */}
            {activeTab === 'stacks' && (
              <div className="space-y-6">
                {loadingStacks ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-rs-accent" />
                  </div>
                ) : stacks.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <Layers className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No tech stacks added yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {stacks.map((stack) => (
                      <div key={stack.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-foreground text-lg">{stack.name}</h3>
                          <p className="text-xs text-muted-foreground min-h-[3rem] line-clamp-3 leading-relaxed">
                            {stack.description || 'No description provided'}
                          </p>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-border/60 mt-4">
                          <button
                            onClick={() => handleDeleteStack(stack.id)}
                            disabled={deleteStackMutation.isPending && deleteStackMutation.variables === stack.id}
                            className="text-xs font-semibold text-muted-foreground hover:text-rs-danger transition-colors flex items-center gap-1 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Stack
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Stack Modal */}
      {isStackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4">
          <form onSubmit={handleCreateStackSubmit} className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Add New Technical Stack</h3>
            <p className="text-xs text-muted-foreground">
              Define a new category stack (e.g. Flutter Development) for student searches.
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Stack Name
                </Label>
                <Input
                  type="text"
                  required
                  value={newStackName}
                  onChange={(e) => setNewStackName(e.target.value)}
                  placeholder="e.g. Flutter Development"
                  className="rounded-xl border-border bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Description
                </Label>
                <textarea
                  value={newStackDesc}
                  onChange={(e) => setNewStackDesc(e.target.value)}
                  placeholder="Describe focus technologies, plugins, and architectures..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-rs-accent focus:outline-none text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsStackModalOpen(false);
                  setNewStackName('');
                  setNewStackDesc('');
                }}
                className="px-4 py-2 border border-border text-muted-foreground hover:bg-muted font-semibold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createStackMutation.isPending || !newStackName.trim()}
                className="px-4 py-2 bg-rs-accent text-white hover:bg-rs-accent-hover font-semibold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {createStackMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Stack
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
