interface StatProps {
  label: string;
  val: string;
  color: string;
  isDark: boolean;
  icon: React.ReactNode;
}

export const StatCard = ({ label, val, color, isDark, icon }: StatProps) => (
  <div
    className={`${isDark ? 'bg-[#181a20] border-[#2b3139]' : 'bg-white border-gray-200'} p-5 rounded-2xl border shadow-sm transition-colors flex justify-between items-center relative overflow-hidden`}>
    {/* Decoración lateral típica de tu versión favorita */}
    <div
      className={`absolute left-0 top-0 bottom-0 w-1 ${color.replace('text-', 'bg-')}`}
    />

    <div className='pl-2'>
      <p className='text-[10px] text-[#848e9c] font-black tracking-widest mb-1 uppercase'>
        {label}
      </p>
      <p className={`text-xl font-black truncate ${color}`}>{val}</p>
    </div>

    <div className={`opacity-20 ${color}`}>{icon}</div>
  </div>
);
