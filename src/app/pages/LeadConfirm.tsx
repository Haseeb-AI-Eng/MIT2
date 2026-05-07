import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';

export function LeadConfirm() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming assignment...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing confirmation token.');
      return;
    }

    async function confirmLead() {
      try {
        const res = await fetch(`/api/form-submissions/lead-confirm?token=${encodeURIComponent(token)}`, {
          method: 'POST',
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Could not confirm the assignment.');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Assignment confirmed successfully.');
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Unexpected error.');
      }
    }

    confirmLead();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">Lead Confirmation</p>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {status === 'loading' ? 'Confirming assignment...' : status === 'success' ? 'Confirmation complete' : 'Unable to confirm'}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{message}</p>
          <div className="mt-8">
            <Button onClick={() => window.location.assign('/')} className="bg-blue-600 text-white hover:bg-blue-700">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
