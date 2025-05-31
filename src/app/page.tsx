
import { redirect } from 'next/navigation';

export default function HomePage() {
  // For now, redirect to dashboard. In a real app, this could be a landing page or check auth.
  // If you want a login page, redirect to '/auth/login'
  redirect('/dashboard');
  return null; // Redirect will prevent rendering
}
