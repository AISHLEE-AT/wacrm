import { redirect } from 'next/navigation';

// Root page: always redirect to the WhatsApp CRM dashboard.
// Auth is enforced by middleware — unauthenticated visitors are
// sent to /login before they ever reach this redirect.
export default function RootPage() {
  redirect('/dashboard');
}
