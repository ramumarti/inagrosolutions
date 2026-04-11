import React from 'react';
import { getSiteConfig } from '@/lib/actions/site-config';
import LandingEditor from '@/components/admin/LandingEditor';

export const dynamic = 'force-dynamic';

export default async function SuperadminLandingPage() {
  const config = await getSiteConfig();
  
  return (
    <div className="w-full">
       <LandingEditor initialConfig={config} />
    </div>
  );
}
