import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, UserCheck, ArrowRight } from 'lucide-react';

export const RoleSelectionScreen: React.FC = () => {
  const { selectRole } = useApp();

  return (
    <div className="w-full h-full bg-[#F4F6F9] font-poppins flex flex-col justify-between overflow-y-auto hide-scrollbar select-none">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-b from-[#091E42] via-[#0E2A59] to-[#123975] text-white pt-[max(22px,env(safe-area-inset-top))] pb-7 px-5 rounded-b-[32px] shadow-md text-center flex-shrink-0">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-black tracking-wider text-white">MANAK</h1>
          <span className="bg-[#FF6B00] text-white text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            GSR 202(E)
          </span>
        </div>
        <p className="text-xs text-blue-200/90 mt-1.5 font-medium tracking-wide">
          National Legal Metrology Portal
        </p>
      </div>

      {/* Role Cards Container */}
      <div className="p-4 sm:p-5 space-y-4 my-auto">
        {/* Officer Card */}
        <div
          onClick={() => selectRole('officer')}
          className="bg-gradient-to-b from-white via-white to-blue-50/25 rounded-[24px] p-5 border border-blue-100/90 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.985] transition-all space-y-5"
        >
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#1462D6] to-[#0A4BB5] text-white flex items-center justify-center shadow-sm">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="bg-[#EBF3FF] text-[#1450A3] border border-[#CCE2FE] text-[10.5px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              ENFORCEMENT MODE
            </span>
          </div>

          {/* Title Row */}
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              Government<br />Official
            </h2>
            <div className="bg-[#EBF3FF] text-[#1450A3] font-bold text-xs px-3 py-2 rounded-xl text-center leading-tight">
              Field<br />Officer
            </div>
          </div>

          {/* Full-width Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectRole('officer');
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#003B95] to-[#005FEA] hover:from-[#003280] hover:to-[#0052CC] active:scale-[0.98] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <span>Officer Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Consumer Card */}
        <div
          onClick={() => selectRole('consumer')}
          className="bg-gradient-to-b from-white via-white to-emerald-50/25 rounded-[24px] p-5 border border-emerald-100/90 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.985] transition-all space-y-5"
        >
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#0F9F71] to-[#067A53] text-white flex items-center justify-center shadow-sm">
              <UserCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="bg-[#E6F9F0] text-[#0A6C44] border border-[#B7F0D4] text-[10.5px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              CITIZEN PORTAL
            </span>
          </div>

          {/* Title Row */}
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              Consumer /<br />Citizen
            </h2>
            <div className="bg-[#E6F9F0] text-[#0A6C44] font-bold text-xs px-3 py-2 rounded-xl text-center leading-tight">
              Public<br />Access
            </div>
          </div>

          {/* Full-width Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectRole('consumer');
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00897B] to-[#009E60] hover:from-[#00796B] hover:to-[#008E55] active:scale-[0.98] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <span>Citizen Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle bottom spacing for safe area */}
      <div className="pb-[max(16px,env(safe-area-inset-bottom))]" />
    </div>
  );
};
