'use client';

import MemberLayout from '@/components/MemberLayout';
import NotificationCenter from '@/components/NotificationCenter';

export default function NotificationsPage() {
  return (
    <MemberLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <NotificationCenter />
      </div>
    </MemberLayout>
  );
}
