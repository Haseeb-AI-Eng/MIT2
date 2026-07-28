import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Pencil, Trash2, Search, Star, ExternalLink } from 'lucide-react';
import {
  adminFetchProjects, adminCreateProject, adminUpdateProject, adminDeleteProject, adminFetchLabs,
} from '../../adminApi';
import { toast } from 'sonner';

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  review: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
};

const EMPTY_FORM = {
  _id: '', title: '', description: '', coverImage: '', videoUrl: '',
  status: 'draft', tags: '', labId: '', lead: '', email: '', featured: false,
};

export function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [projData, labData] = await Promise.all([
        adminFetchProjects(statusFilter !== 'all' ? { status: statusFilter } : {}),
        adminFetchLabs(),
      ]);
      setProjects(projData.projects || []);
      setLabs(labData.labs || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]); // eslint-disable-line

  const filtered = projects.filter((p) =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setForm({
      _id: p._id, title: p.title || '', description: p.description || '', coverImage: p.coverImage || '',
      videoUrl: p.videoUrl || '', status: p.status || 'draft', tags: (p.tags || []).join(', '),
      labId: p.labId?._id || p.labId || '', lead: p.lead || '', email: p.leadEmail || '', featured: !!p.featured,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        coverImage: form.coverImage,
        videoUrl: form.videoUrl,
        status: form.status,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        labId: form.labId || null,
        lead: form.lead,
        email: form.email,
        featured: form.featured,
      };
      if (form._id) {
        const res = await adminUpdateProject(form._id, payload);
        setProjects((prev) => prev.map((p) => (p._id === form._id ? res.project : p)));
        toast.success('Project updated');
      } else {
        const res = await adminCreateProject(payload);
        setProjects((prev) => [res.project, ...prev]);
        toast.success('Project created');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await adminDeleteProject(toDelete);
      setProjects((prev) => prev.filter((p) => p._id !== toDelete));
      toast.success('Project deleted');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <AdminLayout
      title="Projects"
      subtitle={`${projects.length} research projects`}
      actions={
        <Button onClick={openCreate} className="gap-2 bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      }
    >
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-slate-50 border-slate-300" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-48 bg-slate-50 border-slate-300"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--accent-brand,#910B08)] rounded-full animate-spin mx-auto mb-4" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600 font-medium">No projects found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p._id} className="hover:bg-slate-50">
                  <TableCell className="font-semibold text-slate-900 max-w-xs">
                    <div className="flex items-center gap-2">
                      {p.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                      <span className="truncate">{p.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLE[p.status] || 'bg-slate-100'}`}>{p.status}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 max-w-[160px] truncate">{(p.tags || []).join(', ') || '—'}</TableCell>
                  <TableCell className="text-sm text-slate-600">{p.lead || '—'}</TableCell>
                  <TableCell className="text-sm text-slate-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.slug && (
                        <a href={`/projects/${p._id}`} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => openEdit(p)} className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setToDelete(p._id)} className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form._id ? 'Edit Project' : 'New Project'}</DialogTitle>
            <DialogDescription>{form._id ? 'Update project details' : 'Create a new research project'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project title" />
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Cover Image URL</Label>
                <Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label className="mb-1.5 block">Video URL</Label>
                <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Lab</Label>
                <Select value={form.labId || '_none'} onValueChange={(v) => setForm({ ...form, labId: v === '_none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="No lab" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">No lab</SelectItem>
                    {labs.map((l) => <SelectItem key={l._id} value={l._id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Tags (comma separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="AR, VR, machine learning" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Lead Researcher</Label>
                <Input value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} placeholder="Name" />
              </div>
              <div>
                <Label className="mb-1.5 block">Lead Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@mit.edu" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <Label className="block">Featured Project</Label>
                <p className="text-xs text-slate-500">Show this project prominently on the home page</p>
              </div>
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white">
              {saving ? 'Saving...' : form._id ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete Project"
        description="This will permanently delete this project and its data. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
