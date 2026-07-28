import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet';
import { Textarea } from '../../components/ui/textarea';
import { Eye, Trash2, ChevronLeft, ChevronRight, Mail, Phone, Calendar, Save } from 'lucide-react';
import { adminFetchSubmissions, adminUpdateSubmission, adminDeleteSubmission } from '../../adminApi';
import { toast } from 'sonner';

const STATUSES = ['new', 'reviewing', 'contacted', 'accepted', 'rejected'];
const STATUS_STYLE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-purple-100 text-purple-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export function AdminApplications() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [toDelete, setToDelete] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      const data = await adminFetchSubmissions(params);
      setSubmissions(data.submissions || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status, search]); // eslint-disable-line

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminUpdateSubmission(id, { status: newStatus });
      setSubmissions((prev) => prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s)));
      if (selected?._id === id) setSelected({ ...selected, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    try {
      await adminUpdateSubmission(selected._id, { notes });
      toast.success('Notes saved');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await adminDeleteSubmission(toDelete);
      setSubmissions((prev) => prev.filter((s) => s._id !== toDelete));
      setTotal((t) => t - 1);
      setToDelete(null);
      if (selected?._id === toDelete) setSelected(null);
      toast.success('Application deleted');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminLayout title="Applications" subtitle={`${total} total submissions`}>
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search name, email, phone, ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-slate-50 border-slate-300"
        />
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="bg-slate-50 border-slate-300"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" className="border-slate-300" onClick={() => { setSearch(''); setStatus('all'); setPage(1); }}>
          Clear Filters
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--accent-brand,#910B08)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading applications...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No submissions found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s) => (
                  <TableRow key={s._id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-slate-900">{s.name}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{s.email}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{s.phone}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLE[s.status] || 'bg-slate-100 text-slate-700'}`}>
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => { setSelected(s); setNotes(s.notes || ''); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-slate-500">Page {page} of {totalPages} &middot; {total} total</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>Application submitted {new Date(selected.createdAt).toLocaleString()}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selected._id, s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                        selected.status === s ? 'bg-[var(--accent-brand,#910B08)] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-slate-700 hover:text-[var(--accent-brand,#910B08)]">
                    <Mail className="w-4 h-4" /> {selected.email}
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-slate-700 hover:text-[var(--accent-brand,#910B08)]">
                      <Phone className="w-4 h-4" /> {selected.phone}
                    </a>
                  )}
                  {selected.id && <p className="text-slate-500">ID/Passport: <span className="text-slate-800 font-medium">{selected.id}</span></p>}
                </div>

                {(selected.university || selected.program || selected.qualifications) && (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-slate-900 text-sm">Education</h4>
                    {selected.university && <p className="text-sm text-slate-600"><span className="font-medium text-slate-800">University:</span> {selected.university}</p>}
                    {selected.program && <p className="text-sm text-slate-600"><span className="font-medium text-slate-800">Program:</span> {selected.program}</p>}
                    {selected.qualifications && <p className="text-sm text-slate-600 whitespace-pre-wrap">{selected.qualifications}</p>}
                  </div>
                )}

                {(selected.experience || selected.motivation) && (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-slate-900 text-sm">Experience & Motivation</h4>
                    {selected.experience && <p className="text-sm text-slate-600 whitespace-pre-wrap">{selected.experience}</p>}
                    {selected.motivation && <p className="text-sm text-slate-600 whitespace-pre-wrap">{selected.motivation}</p>}
                  </div>
                )}

                {selected.otherInfo && (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-slate-900 text-sm">Additional Info</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{selected.otherInfo}</p>
                  </div>
                )}

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-900 text-sm">Internal Notes</h4>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Add private notes about this applicant..." />
                  <Button size="sm" onClick={handleSaveNotes} className="gap-2"><Save className="w-3.5 h-3.5" /> Save Notes</Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-2"
                  onClick={() => setToDelete(selected._id)}
                >
                  <Trash2 className="w-4 h-4" /> Delete Application
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete Application"
        description="This will permanently delete this submission. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
}
