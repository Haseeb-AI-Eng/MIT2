import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react';
import { adminFetchArticles, adminCreateArticle, adminUpdateArticle, adminDeleteArticle } from '../../adminApi';
import { toast } from 'sonner';

const EMPTY_FORM = { _id: '', title: '', slug: '', description: '', content: '', image: '', category: 'Research', publishDate: '' };

export function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetchArticles({ limit: '200' });
      setArticles(data.articles || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = articles.filter((a) => !search || a.title?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (a: any) => {
    setForm({
      _id: a._id, title: a.title || '', slug: a.slug || '', description: a.description || '',
      content: Array.isArray(a.content) ? a.content.join('\n\n') : (a.content || ''),
      image: a.image || '', category: a.category || 'Research',
      publishDate: a.publishDate ? new Date(a.publishDate).toISOString().slice(0, 10) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description,
        content: form.content.split('\n\n').map((p: string) => p.trim()).filter(Boolean),
        image: form.image,
        category: form.category,
        publishDate: form.publishDate || undefined,
      };
      if (form._id) {
        const res = await adminUpdateArticle(form._id, payload);
        setArticles((prev) => prev.map((a) => (a._id === form._id ? res.article : a)));
        toast.success('Article updated');
      } else {
        const res = await adminCreateArticle(payload);
        setArticles((prev) => [res.article, ...prev]);
        toast.success('Article published');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await adminDeleteArticle(toDelete);
      setArticles((prev) => prev.filter((a) => a._id !== toDelete));
      toast.success('Article deleted');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <AdminLayout
      title="Articles & News"
      subtitle={`${articles.length} articles`}
      actions={
        <Button onClick={openCreate} className="gap-2 bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white">
          <Plus className="w-4 h-4" /> New Article
        </Button>
      }
    >
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-slate-50 border-slate-300" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--accent-brand,#910B08)] rounded-full animate-spin mx-auto mb-4" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600 font-medium">No articles found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a._id} className="hover:bg-slate-50">
                  <TableCell className="font-semibold text-slate-900 max-w-sm truncate">{a.title}</TableCell>
                  <TableCell><span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{a.category}</span></TableCell>
                  <TableCell className="text-sm text-slate-500">{a.publishDate ? new Date(a.publishDate).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {a.slug && (
                        <a href={`/article/${a.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => openEdit(a)} className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setToDelete(a._id)} className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
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
            <DialogTitle>{form._id ? 'Edit Article' : 'New Article'}</DialogTitle>
            <DialogDescription>{form._id ? 'Update article content' : 'Publish a new article or news post'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Slug (optional)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated-if-empty" />
              </div>
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Research" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Description / Excerpt</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Content (separate paragraphs with a blank line)</Label>
              <Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder={'First paragraph...\n\nSecond paragraph...'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Cover Image URL</Label>
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label className="mb-1.5 block">Publish Date</Label>
                <Input type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white">
              {saving ? 'Saving...' : form._id ? 'Save Changes' : 'Publish Article'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete Article"
        description="This will permanently delete this article. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
