
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the new dashboard home page
  redirect('/dashboard/home');
  return null; // Redirect will prevent rendering
}
