'use client';

import React from 'react';

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-4">PORTAL SUPERADMIN (SAFE MODE)</h1>
      <div className="border border-green-500 p-4">
        {children}
      </div>
    </div>
  );
}
