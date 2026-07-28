import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Plus, Pencil, Trash2, Megaphone } from 'lucide-react';
import { adminFetchAnnouncements, adminCreateAnnouncement, adminUpdateAnnouncement, adminDeleteAnnouncement } from '../../adminApi';
import { toast } from 'sonner';

const EMPTY_FORM = { _id: '', title: '', content: '', authorName: '', authorEmail: '' };

export function AdminAnnouncements() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetchAnnouncements();
      setItems(data.announcements || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, authorName: currentUser?.name || '', authorEmail: currentUser?.email || '' });
    setDialogOpen(true);
  };
  const openEdit = (a: any) => { setForm({ _id: a._id, title: a.title, content: a.content, authorName: a.authorName, authorEmail: a.authorEmail }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return; }
    setSaving(true);
    try {
      if (form._id) {
        const res = await adminUpdateAnnouncement(form._id, form);
        setItems((prev) => prev.map((a) => (a._id === form._id ? res.announcement : a)));
        toast.success('Announcement updated');
      } else {
        const res = await adminCreateAnnouncement(form);
        setItems((prev) => [res.announcement, ...prev]);
        toast.success('Announcement posted');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await adminDeleteAnnouncement(toDelete);
      setItems((prev) => prev.filter((a) => a._id !== toDelete));
      toast.success('Announcement deleted');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <AdminLayout
      title="Announcements"
      subtitle={`${items.length} announcements`}
      actions={<Button onClick={openCreate} className="gap-2 bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white"><Plus className="w-4 h-4" /> New Announcement</Button>}
    >
      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--accent-brand,#910B08)] rounded-full animate-spin mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900">{a.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{a.content}</p>
                  <p className="text-xs text-slate-400 mt-3">
                    {a.authorName} &middot; {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(a)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setToDelete(a._id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form._id ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
            <DialogDescription>Announcements can be surfaced to your team or visitors.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Content</Label>
              <Textarea rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Author Name</Label>
                <Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Author Email</Label>
                <Input value={form.authorEmail} onChange={(e) => setForm({ ...form, authorEmail: e.target.value })} />
              </div>
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
        title="Delete Announcement"
        description="This will permanently delete this announcement."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
