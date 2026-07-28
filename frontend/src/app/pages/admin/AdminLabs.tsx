import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Plus, Pencil, Trash2, FlaskConical } from 'lucide-react';
import { adminFetchLabs, adminCreateLab, adminUpdateLab, adminDeleteLab } from '../../adminApi';
import { toast } from 'sonner';

export function AdminLabs() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ _id: '', name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetchLabs();
      setLabs(data.labs || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ _id: '', name: '', description: '' }); setDialogOpen(true); };
  const openEdit = (l: any) => { setForm({ _id: l._id, name: l.name, description: l.description || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Lab name is required'); return; }
    setSaving(true);
    try {
      if (form._id) {
        const res = await adminUpdateLab(form._id, { name: form.name.trim(), description: form.description });
        setLabs((prev) => prev.map((l) => (l._id === form._id ? res.lab : l)));
        toast.success('Lab updated');
      } else {
        const res = await adminCreateLab({ name: form.name.trim(), description: form.description });
        setLabs((prev) => [...prev, res.lab]);
        toast.success('Lab created');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save lab');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await adminDeleteLab(toDelete);
      setLabs((prev) => prev.filter((l) => l._id !== toDelete));
      toast.success('Lab deleted');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <AdminLayout
      title="Labs"
      subtitle={`${labs.length} research labs`}
      actions={<Button onClick={openCreate} className="gap-2 bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white"><Plus className="w-4 h-4" /> New Lab</Button>}
    >
      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--accent-brand,#910B08)] rounded-full animate-spin mx-auto" />
        </div>
      ) : labs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No labs yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((l) => (
            <div key={l._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-brand,#910B08)]/10 text-[var(--accent-brand,#910B08)] flex items-center justify-center">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(l)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setToDelete(l._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-bold text-slate-900">{l.name}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-3">{l.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form._id ? 'Edit Lab' : 'New Lab'}</DialogTitle>
            <DialogDescription>Labs group projects by research focus area.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Lab Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Extended Reality Lab" />
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
        title="Delete Lab"
        description="Projects assigned to this lab will keep their data but lose the lab association."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
