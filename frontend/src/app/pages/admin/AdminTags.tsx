import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { adminFetchTags, adminCreateTag, adminDeleteTag } from '../../adminApi';
import { toast } from 'sonner';

export function AdminTags() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetchTags();
      setTags(data.tags || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newTag.trim()) return;
    setAdding(true);
    try {
      const res = await adminCreateTag(newTag.trim());
      setTags((prev) => [...prev, res.tag].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTag('');
      toast.success('Tag added');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add tag');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await adminDeleteTag(toDelete.id);
      setTags((prev) => prev.filter((t) => t._id !== toDelete.id));
      toast.success('Tag removed');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <AdminLayout title="Tags" subtitle={`${tags.length} tags used across projects & articles`}>
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
        <div className="flex gap-3 max-w-md">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="New tag name..."
            className="bg-slate-50 border-slate-300"
          />
          <Button onClick={handleAdd} disabled={adding || !newTag.trim()} className="gap-2 bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white shrink-0">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--accent-brand,#910B08)] rounded-full animate-spin mx-auto" />
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <TagIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No tags yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t._id} className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                {t.name}
                <button onClick={() => setToDelete({ id: t._id, name: t.name })} className="w-4 h-4 rounded-full hover:bg-slate-300 flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Remove Tag"
        description={`Remove the tag "${toDelete?.name}"? It will remain on existing projects/articles until they're re-saved.`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
