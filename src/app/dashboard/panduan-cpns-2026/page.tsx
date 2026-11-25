'use client';

import React from 'react';
import MemberLayout from '@/components/MemberLayout';
import PanduanCPNS2026Content from '@/components/PanduanCPNS2026Content';

export default function MemberPanduanCPNS2026Page() {
  return (
    <MemberLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-10">
        <PanduanCPNS2026Content
          isMember={true}
          defaultTab="semua"
          showPrintButton={true}
        />
      </div>
    </MemberLayout>
  );
}
