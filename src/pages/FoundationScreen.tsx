import { Briefcase } from 'lucide-react';

function FoundationScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-10">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 mb-6">
          <Briefcase className="w-8 h-8 text-white" strokeWidth={2} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1.5">
          BizFlow
        </h1>
        <p className="text-base text-gray-600 font-medium mb-8">
          Business &amp; Personal Finance Manager
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-8 shadow-sm">
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Offline-first business and personal finance management.
          </p>

          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Application foundation ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoundationScreen;
