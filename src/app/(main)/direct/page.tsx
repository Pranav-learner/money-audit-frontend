import { redirect } from 'next/navigation';

export default function DirectRedirect() {
  redirect('/contacts');
}
