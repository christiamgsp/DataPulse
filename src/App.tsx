import { useEffect, useState, useMemo } from 'react';
import { useTheme } from './hooks/useTheme';
import { StatCard } from './components/StatCard';
import { Chart } from './components/Chart';
import { Header } from './components/Header';
import { SkeletonCard } from './components/SkeletonCard';

export interface Producto {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

const GENERAR_RESPALDO = (): Producto[] => {
  const nombres = [
    'Procesador Quantum X1',
    'Servidor Cloud Ultra',
    'Sensor Bio-Métrico',
    'Módulo de Red Fibra',
    'Disco Sólido Titanio',
    'Cámara Vigilancia IA',
    'Router Mesh Pro',
    'GPU Render Master',
    'Panel Solar Portátil',
    'Teclado Mecánico Neon',
    'Monitor Curvo 4K',
    'Cable Datos Oro',
    'Batería Larga Duración',
    'Hub USB-C Industrial',
    'Smartphone Encriptado',
    'Tablet Gráfica Pro',
    'Altavoz Inteligente',
    'Reloj Biométrico',
    'Kit Robótica Avanzado',
    'Gafas Realidad Virtual',
  ];
  const categorias = [
    'Electrónica',
    'Hardware',
    'Infraestructura',
    'Periféricos',
  ];

  return nombres.map((nombre, i) => ({
    id: 900 + i,
    title: nombre,
    price: Math.floor(Math.random() * (4500 - 20) + 20),
    description:
      'Componente de alta tecnología diseñado para optimizar el flujo de trabajo y garantizar la máxima eficiencia en entornos profesionales.',
    category: categorias[i % categorias.length],
    image: `https://picsum.photos/seed/${i + 50}/400/400`,
    rating: {
      rate: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
      count: Math.floor(Math.random() * 2500),
    },
  }));
};

const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrecio, setFiltroPrecio] = useState<'todos' | 'bajo' | 'alto'>(
    'todos'
  );
  const [selected, setSelected] = useState<Producto | null>(null);
  const isDark = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) throw new Error('API Fallida');
        const data = await response.json();

        const dataVariada = data.map((p: Producto, i: number) => ({
          ...p,
          price: i % 2 === 0 ? p.price * 12 : p.price,
          rating: {
            ...p.rating,
            count: Math.floor(Math.random() * 1800),
          },
        }));

        setProductos(dataVariada);
      } catch (error) {
        setProductos(GENERAR_RESPALDO());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtrados = useMemo(() => {
    const query = busqueda.toLowerCase().trim();
    return productos.filter((p) => {
      const matchName = p.title.toLowerCase().includes(query);
      const matchCat = p.category.toLowerCase().includes(query);
      const match = matchName || matchCat;

      if (filtroPrecio === 'bajo') return match && p.price < 1000;
      if (filtroPrecio === 'alto') return match && p.price >= 1000;
      return match;
    });
  }, [productos, busqueda, filtroPrecio]);

  const stats = useMemo(() => {
    if (productos.length === 0)
      return { total: 0, top: null, low: null, avg: 0 };
    const total = productos.reduce((acc, p) => acc + p.price, 0);
    const sorted = [...productos].sort(
      (a, b) => (b.rating?.count || 0) - (a.rating?.count || 0)
    );
    return {
      total,
      top: sorted[0],
      low: sorted[sorted.length - 1],
      avg: total / productos.length,
    };
  }, [productos]);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0b0e11] text-[#eaecef]' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      <Header />
      <main className='max-w-7xl mx-auto p-4 md:p-8'>
        <div className='grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4'>
            <StatCard
              isDark={isDark}
              label='VALOR TOTAL'
              color='text-[#2ebd85]'
              val={loading ? '---' : euroFormatter.format(stats.total)}
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
              label='MÁS VENDIDO'
              color='text-[#f0b90b]'
              val={loading ? '...' : stats.top?.title.slice(0, 15) + '...'}
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
              label='MENOS VENTAS'
              color='text-[#f6465d]'
              val={loading ? '...' : stats.low?.title.slice(0, 15) + '...'}
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
              label='PROMEDIO'
              color={isDark ? 'text-white' : 'text-slate-900'}
              val={loading ? '---' : euroFormatter.format(stats.avg)}
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
              className={`${isDark ? 'bg-[#181a20] border-[#2b3139]' : 'bg-white border-gray-200'} p-4 rounded-2xl border flex flex-row lg:flex-col gap-2 mt-4`}>
              {['todos', 'bajo', 'alto'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroPrecio(f as any)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${filtroPrecio === f ? 'bg-[#f0b90b] text-black' : isDark ? 'bg-[#0b0e11] text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                  {f === 'bajo'
                    ? '< 1000€'
                    : f === 'alto'
                      ? '> 1000€'
                      : 'Todos'}
                </button>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-6 overflow-hidden'>
            <div
              className={`${isDark ? 'bg-[#181a20] border-[#2b3139]' : 'bg-white border-gray-200'} p-6 rounded-3xl border shadow-xl min-h-[450px] flex flex-col`}>
              <div className='flex-1 relative'>
                {loading ? (
                  <div className='h-full flex items-center justify-center animate-pulse'>
                    <span className='text-[10px] font-black text-[#848e9c] text-center uppercase tracking-widest'>
                      Analizando Activos...
                    </span>
                  </div>
                ) : filtrados.length > 0 ? (
                  <Chart data={filtrados} isDark={isDark} />
                ) : (
                  <div className='h-full flex flex-col items-center justify-center opacity-40 text-center'>
                    <span className='text-4xl mb-4'>⚠️</span>
                    <p className='font-black text-xs uppercase tracking-widest'>
                      No se encontró el activo
                    </p>
                  </div>
                )}
              </div>
            </div>
            <input
              type='text'
              placeholder='Buscar activos...'
              className={`w-full p-5 rounded-2xl outline-none border transition-all ${isDark ? 'bg-[#181a20] border-[#2b3139] text-white focus:border-[#f0b90b]' : 'bg-white border-gray-200 focus:border-orange-500 shadow-md'}`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12'>
          {loading ? (
            Array(8)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} isDark={isDark} />)
          ) : filtrados.length > 0 ? (
            filtrados.map((p) => (
              <div
                key={p.id}
                className={`${isDark ? 'bg-[#181a20] border-[#2b3139]' : 'bg-white border-gray-200 shadow-sm'} border p-5 rounded-2xl hover:-translate-y-1 transition-all group`}>
                <div className='h-40 bg-white rounded-xl mb-4 flex justify-center p-4'>
                  <img
                    src={p.image}
                    className='max-h-full object-contain'
                    alt=''
                  />
                </div>
                <h3 className='text-[11px] font-bold mb-4 line-clamp-2'>
                  {p.title}
                </h3>
                <div className='flex justify-between items-center pt-4 border-t border-gray-500/10'>
                  <span className='text-lg font-black'>
                    {euroFormatter.format(p.price)}
                  </span>
                  <button
                    onClick={() => setSelected(p)}
                    className={`text-[10px] font-black px-4 py-2 rounded-lg ${isDark ? 'bg-[#2b3139] text-white hover:bg-[#f0b90b] hover:text-black' : 'bg-gray-100 text-gray-600'}`}>
                    INFO
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-full py-20 text-center border-2 border-dashed border-gray-500/10 rounded-3xl opacity-30'>
              <p className='text-xs font-black uppercase'>
                Sin resultados en el inventario activo
              </p>
            </div>
          )}
        </div>
      </main>

      {selected && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md'
          onClick={() => setSelected(null)}>
          <div
            className={`${isDark ? 'bg-[#1e2329] border-[#2b3139]' : 'bg-white border-gray-200'} border w-full max-w-xl rounded-3xl p-8 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}>
            <h2
              className={`text-xl font-black mb-4 ${isDark ? 'text-[#f0b90b]' : 'text-orange-600'}`}>
              {selected.title}
            </h2>
            <p className='text-sm opacity-70 mb-6'>{selected.description}</p>
            <div className='flex justify-between items-center border-t border-gray-500/10 pt-4'>
              <span className='font-black text-xl'>
                {euroFormatter.format(selected.price)}
              </span>
              <span className='text-[10px] font-bold uppercase text-[#2ebd85]'>
                {selected.rating.count} Ventas
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className='w-full mt-8 py-4 bg-[#f0b90b] text-black font-black rounded-xl uppercase tracking-widest'>
              Cerrar Vista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
