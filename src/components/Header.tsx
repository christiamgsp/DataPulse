import { useTheme } from '../hooks/useTheme';

export const Header = () => {
  const isDark = useTheme();

  return (
    <header
      className={`sticky top-0 z-[50] w-full border-b backdrop-blur-md transition-colors duration-500 ${
        isDark
          ? 'bg-[#0b0e11]/80 border-[#2b3139]'
          : 'bg-white/80 border-gray-200'
      }`}>
      <div className='max-w-7xl mx-auto px-4 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-[#f0b90b] rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20'>
            <svg
              className='w-5 h-5 text-black'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='3'
                d='M13 10V3L4 14h7v7l9-11h-7z'
              />
            </svg>
          </div>
          <span
            className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
            DATA<span className='text-[#f0b90b]'>PULSE</span>
          </span>
        </div>

        <div className='flex items-center gap-4'>
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
              isDark
                ? 'bg-green-500/10 text-green-400'
                : 'bg-green-100 text-green-700'
            }`}>
            ● Sistema Live
          </div>
        </div>
      </div>
    </header>
  );
};
