'use client';

import { GraduationCap } from 'lucide-react';

export default function TeachoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center space-y-6">
      <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
        <GraduationCap className="w-12 h-12 text-amber-500" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight">
        TeachO
      </h1>
      <p className="text-slate-400 max-w-md mx-auto text-lg">
        The native TeachO module is currently under development. Courses and tuitions will be available here soon.
      </p>
    </div>
  );
}
