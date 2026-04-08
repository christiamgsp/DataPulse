import { useEffect, useState, useMemo } from 'react';
import { useTheme } from './hooks/useTheme';
import { StatCard } from './components/StatCard';
import { Chart } from './components/Chart';

export interface Producto {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrecio, setFiltroPrecio] = useState<'todos' | 'bajo' | 'alto'>(
    'todos'
  );
  const [selected, setSelected] = useState<Producto | null>(null);
  const isDark = useTheme();

  useEffect(() => {
    fetch('https://fakestoreapi.com/products?limit=20')
      .then((res) => res.json())
      .then(setProductos);
  }, []);

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      const match =
        p.title.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.category.toLowerCase().includes(busqueda.toLowerCase());
      if (filtroPrecio === 'bajo') return match && p.price < 50;
      if (filtroPrecio === 'alto') return match && p.price >= 50;
      return match;
    });
  }, [productos, busqueda, filtroPrecio]);

  const stats = useMemo(
    () => ({
      total: filtrados.reduce((acc, p) => acc + p.price, 0),
      top: [...filtrados].sort((a, b) => b.rating.count - a.rating.count)[0],
      low: [...filtrados].sort((a, b) => a.rating.count - b.rating.count)[0],
      avg: filtrados.length
        ? filtrados.reduce((acc, p) => acc + p.price, 0) / filtrados.length
        : 0,
    }),
    [filtrados]
  );

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors duration-500 ${isDark ? 'bg-[#0b0e11] text-[#eaecef]' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      {/* MODAL DETALLES */}
      {selected && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
          onClick={() => setSelected(null)}>
          <div
            className={`${isDark ? 'bg-[#1e2329] border-[#474d57]' : 'bg-white border-gray-200'} border w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200`}
            onClick={(e) => e.stopPropagation()}>
            <div className='flex flex-col md:flex-row gap-8'>
              <div className='bg-white rounded-2xl p-4 w-full md:w-1/2 flex items-center justify-center shadow-inner'>
                <img
                  src={selected.image}
                  className='max-h-60 object-contain'
                  alt=''
                />
              </div>
              <div className='flex-1'>
                <h2
                  className={`text-2xl font-black ${isDark ? 'text-[#f0b90b]' : 'text-orange-600'}`}>
                  {selected.title}
                </h2>
                <p className='text-gray-500 text-[10px] font-bold uppercase mt-1 mb-4'>
                  {selected.category}
                </p>
                <p className='text-sm opacity-70 mb-6'>
                  {selected.description}
                </p>
                <div className='border-t border-gray-500/10 pt-4 space-y-2'>
                  <div className='flex justify-between text-xs font-bold'>
                    <span>Ventas:</span>{' '}
                    <span className='text-[#2ebd85]'>
                      {selected.rating.count} uds
                    </span>
                  </div>
                  <div className='flex justify-between text-xs font-bold'>
                    <span>Precio:</span>{' '}
                    <span>{euroFormatter.format(selected.price)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className='w-full mt-6 py-3 bg-[#f0b90b] text-black font-black rounded-xl hover:bg-[#e0a808]'>
                  CERRAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6'>
          {/* SIDEBAR CON ICONOS RECARGADOS */}
          <div className='space-y-4'>
            <StatCard
              isDark={isDark}
              label='VALOR TOTAL'
              color='text-[#2ebd85]'
              val={euroFormatter.format(stats.total)}
              icon={
                <svg
                  className='w-10 h-10'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z' />
                </svg>
              }
            />
            <StatCard
              isDark={isDark}
              label='LÍDER EN VENTAS'
              color='text-[#f0b90b]'
              val={stats.top?.title || '---'}
              icon={
                <svg
                  className='w-10 h-10'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z' />
                </svg>
              }
            />
            <StatCard
              isDark={isDark}
              label='PEOR RENDIMIENTO'
              color='text-[#f6465d]'
              val={stats.low?.title || '---'}
              icon={
                <svg
                  className='w-10 h-10'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z' />
                </svg>
              }
            />
            <StatCard
              isDark={isDark}
              label='PRECIO PROMEDIO'
              color={isDark ? 'text-gray-100' : 'text-slate-900'}
              val={euroFormatter.format(stats.avg)}
              icon={
                <svg
                  className='w-10 h-10'
                  fill='currentColor'
                  viewBox='0 0 24 24'>
                  <path d='M11.8 2.1c-3.5.3-6.4 3.2-6.7 6.7C4.7 12.7 7.7 16 11.5 16h.5v4l5-5-5-5v4h-.5c-1.9 0-3.5-1.6-3.5-3.5 0-1.7 1.2-3.1 2.8-3.4.5-.1.7-.6.6-1.1-.1-.5-.6-.7-1.1-.6z' />
                </svg>
              }
            />

            <div
              className={`${isDark ? 'bg-[#181a20] border-[#2b3139]' : 'bg-white border-gray-200'} p-4 rounded-2xl border flex flex-col gap-2`}>
              {['todos', 'bajo', 'alto'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroPrecio(f as any)}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filtroPrecio === f ? 'bg-[#f0b90b] text-black' : isDark ? 'bg-[#0b0e11] text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-6'>
            <div
              className={`${isDark ? 'bg-[#181a20] border-[#2b3139]' : 'bg-white border-gray-200'} p-8 rounded-3xl border shadow-xl flex flex-col min-h-[500px]`}>
              <h3 className='text-xs font-black text-[#848e9c] mb-8 tracking-widest uppercase'>
                Análisis de Volumen de Activos
              </h3>
              <div className='flex-1 relative'>
                {filtrados.length > 0 ? (
                  <Chart data={filtrados} isDark={isDark} />
                ) : (
                  <div className='h-full flex flex-col items-center justify-center opacity-40'>
                    <span className='text-5xl mb-2'>🔍</span>
                    <p className='font-black text-xs uppercase'>
                      No se encontraron activos
                    </p>
                  </div>
                )}
              </div>
            </div>
            <input
              type='text'
              placeholder='Escribe para buscar activos en el mercado...'
              className={`w-full p-5 rounded-2xl outline-none border transition-all ${isDark ? 'bg-[#181a20] border-[#2b3139] focus:border-[#f0b90b]' : 'bg-white border-gray-200 focus:border-orange-500 shadow-md'}`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* GRID DE PRODUCTOS */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12'>
          {filtrados.map((p) => (
            <div
              key={p.id}
              className={`${isDark ? 'bg-[#181a20] border-[#2b3139]' : 'bg-white border-gray-200 shadow-sm'} border p-5 rounded-2xl hover:-translate-y-1 transition-all group`}>
              <div className='h-40 bg-white rounded-xl mb-4 flex justify-center p-4 shadow-inner'>
                <img
                  src={p.image}
                  className='max-h-full group-hover:scale-110 transition-transform'
                  alt=''
                />
              </div>
              <h3 className='text-xs font-bold mb-4 line-clamp-2 h-9 opacity-90'>
                {p.title}
              </h3>
              <div className='flex justify-between items-center pt-4 border-t border-gray-500/10'>
                <span
                  className='text-lg font-black'
                  style={{
                    color: p.rating.count >= 200 ? '#2ebd85' : '#f6465d',
                  }}>
                  {euroFormatter.format(p.price)}
                </span>
                <button
                  onClick={() => setSelected(p)}
                  className={`text-[10px] font-black px-4 py-2 rounded-lg ${isDark ? 'bg-[#2b3139] text-white hover:bg-[#f0b90b] hover:text-black' : 'bg-gray-100 text-gray-600 hover:bg-orange-500 hover:text-white'}`}>
                  INFO
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
