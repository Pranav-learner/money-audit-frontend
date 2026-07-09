import { UserCircle } from 'lucide-react';
import { PagePlaceholder } from '@/shared/components/common/page-placeholder';

export default function ProfilePage() {
  return (
    <PagePlaceholder
      title="Profile"
      icon={UserCircle}
      description="Manage your account details and preferences."
      highlights={[
        'Edit your name, email and phone number',
        'Update your password and security settings',
        'Control notification and theme preferences',
      ]}
    />
  );
}
