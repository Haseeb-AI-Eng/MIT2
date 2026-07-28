import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Pencil, Trash2, ShieldCheck, Search } from 'lucide-react';
import { adminFetchUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../../adminApi';
import { toast } from 'sonner';

const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-[var(--accent-brand,#910B08)]/10 text-[var(--accent-brand,#910B08)]',
  researcher: 'bg-blue-100 text-blue-700',
  student: 'bg-slate-100 text-slate-600',
};

const EMPTY_FORM = { _id: '', name: '', email: '', password: '', role: 'student' };

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetchUsers();
      setUsers(data.users || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (u: any) => { setForm({ _id: u._id, name: u.name, email: u.email, password: '', role: u.role }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required'); return; }
    setSaving(true);
    try {
      if (form._id) {
        const payload: any = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        const res = await adminUpdateUser(form._id, payload);
        setUsers((prev) => prev.map((u) => (u._id === form._id ? res.user : u)));
        toast.success('User updated');
      } else {
        if (!form.password) { toast.error('Password is required for new users'); setSaving(false); return; }
        const res = await adminCreateUser(form);
        setUsers((prev) => [...prev, res.user]);
        toast.success('User created');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await adminDeleteUser(toDelete);
      setUsers((prev) => prev.filter((u) => u._id !== toDelete));
      toast.success('User removed');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <AdminLayout
      title="Users & Roles"
      subtitle={`${users.length} accounts`}
      actions={<Button onClick={openCreate} className="gap-2 bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white"><Plus className="w-4 h-4" /> New User</Button>}
    >
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-slate-50 border-slate-300" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--accent-brand,#910B08)] rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600 font-medium">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u._id} className="hover:bg-slate-50">
                  <TableCell className="font-semibold text-slate-900 flex items-center gap-2">
                    {u.name}
                    {u._id === currentUser?._id && <span className="text-[10px] font-bold text-slate-400 uppercase">You</span>}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{u.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${ROLE_STYLE[u.role] || 'bg-slate-100'}`}>
                      {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />} {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                      <button
                        disabled={u._id === currentUser?._id}
                        onClick={() => setToDelete(u._id)}
                        className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form._id ? 'Edit User' : 'New User'}</DialogTitle>
            <DialogDescription>{form._id ? 'Update account details and role' : 'Create a new team account'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">{form._id ? 'New Password (optional)' : 'Password'}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={form._id ? 'Leave blank to keep current' : ''} />
            </div>
            <div>
              <Label className="mb-1.5 block">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white">{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Remove User"
        description="This will permanently delete this account. Their project contributions will remain on record."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
