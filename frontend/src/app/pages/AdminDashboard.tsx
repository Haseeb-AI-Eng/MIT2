import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertCircle, LogOut, ChevronLeft, ChevronRight, Eye, Trash2, CheckCircle, Clock, Filter, Calendar, TrendingUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

interface FormSubmission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  id: string;
  status: string;
  createdAt: string;
  qualifications?: string;
  experience?: string;
  motivation?: string;
  university?: string;
  program?: string;
  otherInfo?: string;
  notes?: string;
}

interface PaginationData {
  submissions: FormSubmission[];
  total: number;
  page: number;
  totalPages: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, byStatus: {} });
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const authChecked = useRef(false);
  const dataFetchedRef = useRef(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Check auth only once on mount
  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;

    if (!token || !user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, []);

  // Fetch submissions
  const fetchSubmissions = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(status !== 'all' && { status }),
        ...(search && { search })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://hello-world--k34449363.replit.app'}/api/form-submissions?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch submissions');
      }

      const data: PaginationData = await response.json();
      setSubmissions(data.submissions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://hello-world--k34449363.replit.app'}/api/form-submissions-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch data only when page, status, or search changes
  useEffect(() => {
    if (!token || !user) return;
    
    fetchSubmissions();
    fetchStats();
  }, [page, status, search]);

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://hello-world--k34449363.replit.app'}/api/form-submissions/${submissionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      // Show success message and dialog
      const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('-', ' ');
      setSuccessMessage(`Application status changed to: ${statusText}`);
      setShowSuccess(true);
      setShowSuccessDialog(true);

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => sub._id === submissionId ? { ...sub, status: newStatus } : sub)
      );
      
      if (selectedSubmission?._id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }

      // Refetch stats
      fetchStats();

      // Close details and redirect after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setShowSuccessDialog(false);
        setSelectedSubmission(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!submissionToDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://hello-world--k34449363.replit.app'}/api/form-submissions/${submissionToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete submission');

      // Update local state instead of refetching
      setSubmissions(prev => prev.filter(sub => sub._id !== submissionToDelete));
      setTotal(prev => prev - 1);
      
      setDeleteConfirm(false);
      setSubmissionToDelete(null);
      
      // Only refetch stats once
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-700';
      case 'contacted':
        return 'bg-green-100 text-green-700';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (selectedSubmission) {
    // Check if submission still exists by verifying basic properties
    if (!selectedSubmission._id || !selectedSubmission.name) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to List
              </button>
            </div>
          </header>
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h3>
              <p className="text-gray-600 mb-6">This submission may have been deleted or is no longer available.</p>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setPage(1);
                  fetchSubmissions();
                }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Return to List
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">E</span>
                  </div>
                  <div className="flex flex-col gap-0">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">ELEMENTS</h1>
                    <p className="text-xs font-semibold text-blue-600 tracking-wider">INTERACTIVE</p>
                  </div>
                </div>
                <div className="h-8 border-l border-slate-300"></div>
                <h2 className="text-lg font-semibold text-gray-900">Application Details</h2>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 font-semibold rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Status Update Section */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Application Status</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedSubmission.status)}`}>
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSubmissionToDelete(selectedSubmission._id);
                    setDeleteConfirm(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Update Status</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['new', 'reviewing', 'contacted', 'accepted', 'rejected'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => handleStatusChange(selectedSubmission._id, statusOption)}
                      className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 ${
                        selectedSubmission.status === statusOption
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                      }`}
                    >
                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded"></div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Full Name</p>
                    <p className="text-xl font-bold text-gray-900">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email Address</p>
                    <a href={`mailto:${selectedSubmission.email}`} className="text-xl font-bold text-blue-600 hover:text-blue-700 break-all">
                      {selectedSubmission.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Phone Number</p>
                    <a href={`tel:${selectedSubmission.phone}`} className="text-xl font-bold text-gray-900 hover:text-blue-600">
                      {selectedSubmission.phone}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">ID/Passport</p>
                    <p className="text-xl font-bold text-gray-900">{selectedSubmission.id}</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              {(selectedSubmission.university || selectedSubmission.program || selectedSubmission.qualifications) && (
                <div className="mb-8 pb-8 border-b border-slate-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded"></div>
                    Education & Qualifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {selectedSubmission.university && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">University</p>
                        <p className="text-gray-900 leading-relaxed">{selectedSubmission.university}</p>
                      </div>
                    )}
                    {selectedSubmission.program && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Program</p>
                        <p className="text-gray-900 leading-relaxed">{selectedSubmission.program}</p>
                      </div>
                    )}
                    {selectedSubmission.qualifications && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Qualifications & Skills</p>
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedSubmission.qualifications}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Experience & Motivation */}
              {(selectedSubmission.experience || selectedSubmission.motivation) && (
                <div className="mb-8 pb-8 border-b border-slate-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-yellow-600 rounded"></div>
                    Experience & Motivation
                  </h3>
                  <div className="space-y-8">
                    {selectedSubmission.experience && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Professional/Research Experience</p>
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedSubmission.experience}</p>
                      </div>
                    )}
                    {selectedSubmission.motivation && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Motivation & Interest</p>
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedSubmission.motivation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other Info */}
              {selectedSubmission.otherInfo && (
                <div className="mb-8 pb-8 border-b border-slate-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded"></div>
                    Additional Information
                  </h3>
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{selectedSubmission.otherInfo}</p>
                </div>
              )}

              {/* Submission Date */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Submitted On</p>
                <p className="text-gray-900 font-semibold">
                  {new Date(selectedSubmission.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Dialog */}
        {showSuccessDialog && (
          <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <AlertDialogContent className="max-w-md">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <AlertDialogTitle className="text-xl font-bold text-gray-900 mt-2">Status Updated</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 mt-2 text-sm">
                  {successMessage}
                </AlertDialogDescription>
                <p className="text-xs text-gray-500 mt-3">You will be redirected back to the list.</p>
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => {
                    setShowSuccessDialog(false);
                    setSelectedSubmission(null);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                >
                  Done
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
            <AlertDialogContent className="max-w-md">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <AlertDialogTitle className="text-xl font-bold text-gray-900 mt-2">Delete Submission</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 mt-3 text-sm">
                  Are you sure you want to permanently delete this submission from <span className="font-semibold">{selectedSubmission.name}</span>? This action cannot be undone.
                </AlertDialogDescription>
              </div>
              <div className="flex gap-3 justify-center mt-6">
                <AlertDialogCancel className="border-slate-300 text-gray-700 hover:bg-slate-50">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                  Delete Permanently
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Logo and Branding */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <div className="flex items-center gap-4">
              {/* Logo/Branding */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div className="flex flex-col gap-0">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">ELEMENTS</h1>
                  <p className="text-xs font-semibold text-blue-600 tracking-wider">INTERACTIVE</p>
                </div>
              </div>
              <div className="hidden md:flex h-8 border-l border-slate-300"></div>
              <div className="hidden md:flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
                <p className="text-xs text-gray-600">Manage Applications</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-1">Welcome back,</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{user?.email?.split('@')[0] || 'Admin'}</h2>
              <p className="text-blue-50 text-sm md:text-base max-w-lg">You have the power to manage and track all application submissions. Make informed decisions to build the best team.</p>
            </div>
            <div className="hidden md:block text-blue-300 opacity-20">
              <TrendingUp className="w-24 h-24" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Total</p>
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-2">All submissions</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">New</p>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-blue-600">{(stats.byStatus as any)['new'] || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Awaiting review</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-yellow-600 text-xs font-semibold uppercase tracking-wider">Reviewing</p>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-yellow-600">{(stats.byStatus as any)['reviewing'] || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Under review</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Contacted</p>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-green-600">{(stats.byStatus as any)['contacted'] || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Contacted candidates</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider">Accepted</p>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-emerald-600">{(stats.byStatus as any)['accepted'] || 0}</p>
            <p className="text-xs text-slate-500 mt-2">Accepted</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <Input
                placeholder="Name, email, phone, ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border-slate-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <Select value={status} onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}>
                <SelectTrigger className="bg-slate-50 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                  setPage(1);
                }}
                variant="outline"
                className="w-full border-slate-300 text-gray-700 hover:bg-slate-50"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">No submissions found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="text-gray-900 font-bold text-sm">Name</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Email</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Phone</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Status</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Submitted</TableHead>
                    <TableHead className="text-gray-900 font-bold text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission._id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                      <TableCell className="font-semibold text-gray-900">{submission.name}</TableCell>
                      <TableCell className="text-gray-700 text-sm">{submission.email}</TableCell>
                      <TableCell className="text-gray-700 text-sm">{submission.phone}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(submission.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1).replace('-', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm">
                        {new Date(submission.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
                <p className="text-gray-600 text-sm font-medium">
                  Showing <span className="font-bold text-gray-900">{((page - 1) * 20) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * 20, total)}</span> of <span className="font-bold text-gray-900">{total}</span> submissions
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="gap-2 border-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-300">
                    <span className="text-gray-900 font-bold">{page}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{totalPages}</span>
                  </div>
                  <Button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    className="gap-2 border-slate-300"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Success Confirmation Dialog */}
      {showSuccessDialog && (
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="max-w-md">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 mt-2">Status Updated</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 mt-2 text-sm">
                {successMessage}
              </AlertDialogDescription>
              <p className="text-xs text-gray-500 mt-3">You will be redirected back to the list.</p>
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  setSelectedSubmission(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
              >
                Done
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {deleteConfirm && (
        <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
          <AlertDialogContent className="max-w-md">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 mt-2">Delete Submission</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 mt-3 text-sm">
                Are you sure you want to permanently delete this submission? This action cannot be undone.
              </AlertDialogDescription>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <AlertDialogCancel className="border-slate-300 text-gray-700 hover:bg-slate-50">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
