export const SkeletonCard = ({ isDark }: { isDark: boolean }) => (
  <div
    className={`${isDark ? 'bg-[#181a20] border-[#2b3139]' : 'bg-white border-gray-200'} border p-5 rounded-2xl animate-pulse`}>
    <div
      className={`h-40 ${isDark ? 'bg-[#2b3139]' : 'bg-gray-100'} rounded-xl mb-4`}
    />
    <div
      className={`h-3 w-3/4 ${isDark ? 'bg-[#2b3139]' : 'bg-gray-100'} rounded mb-2`}
    />
    <div
      className={`h-3 w-1/2 ${isDark ? 'bg-[#2b3139]' : 'bg-gray-100'} rounded mb-6`}
    />
    <div className='flex justify-between items-center pt-4 border-t border-gray-500/10'>
      <div
        className={`h-6 w-20 ${isDark ? 'bg-[#2b3139]' : 'bg-gray-100'} rounded`}
      />
      <div
        className={`h-8 w-16 ${isDark ? 'bg-[#2b3139]' : 'bg-gray-100'} rounded`}
      />
    </div>
  </div>
);
