import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

export interface Producto {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrecio, setFiltroPrecio] = useState<'todos' | 'bajo' | 'alto'>(
    'todos'
  );
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const euroFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

  const getBinanceColor = (count: number) => {
    if (count >= 500) return '#2ebd85';
    if (count >= 200) return '#f0b90b';
    return '#f6465d';
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideTexto =
      p.title.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.category.toLowerCase().includes(busqueda.toLowerCase());
    if (filtroPrecio === 'bajo') return coincideTexto && p.price < 50;
    if (filtroPrecio === 'alto') return coincideTexto && p.price >= 50;
    return coincideTexto;
  });

  const stats = {
    valorTotal: productosFiltrados.reduce((acc, p) => acc + p.price, 0),
    masVendido: [...productosFiltrados].sort(
      (a, b) => b.rating.count - a.rating.count
    )[0],
    menosVendido: [...productosFiltrados].sort(
      (a, b) => a.rating.count - b.rating.count
    )[0],
    precioMedio:
      productosFiltrados.length > 0
        ? productosFiltrados.reduce((acc, p) => acc + p.price, 0) /
          productosFiltrados.length
        : 0,
  };

  useEffect(() => {
    if (!cargando && productosFiltrados.length > 0 && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const width = 300;
      const height = 120;
      const margin = { top: 10, right: 10, bottom: 20, left: 25 };
      const maxVentas =
        d3.max(productosFiltrados, (d) => d.rating.count) || 600;

      const yScale = d3
        .scaleLinear()
        .domain([0, maxVentas])
        .range([height - margin.bottom, margin.top]);
      const xScale = d3
        .scaleBand()
        .domain(productosFiltrados.map((_, i) => i.toString()))
        .range([margin.left, width - margin.right])
        .padding(0.4);

      const tooltip = d3
        .select('body')
        .append('div')
        .style('position', 'absolute')
        .style('background', '#1e2329')
        .style('color', 'white')
        .style('padding', '6px 10px')
        .style('border', '1px solid #474d57')
        .style('border-radius', '4px')
        .style('font-size', '10px')
        .style('pointer-events', 'none')
        .style('visibility', 'hidden')
        .style('z-index', '100');

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5))
        .attr('font-size', '5px')
        .attr('color', '#848e9c')
        .selectAll('path,line')
        .attr('stroke', '#2b3139');

      svg
        .selectAll('rect')
        .data(productosFiltrados)
        .join('rect')
        .attr('x', (_, i) => xScale(i.toString())!)
        .attr('width', xScale.bandwidth())
        .attr('fill', (d) => getBinanceColor(d.rating.count))
        .attr('y', height - margin.bottom)
        .attr('height', 0)
        .on('mouseover', (event, d) => {
          tooltip
            .style('visibility', 'visible')
            .html(
              `<strong>${d.title}</strong><br/>Ventas: ${d.rating.count}<br/>Precio: ${euroFormatter.format(d.price)}`
            );
          d3.select(event.currentTarget).attr('opacity', 0.8);
        })
        .on('mousemove', (event) => {
          tooltip
            .style('top', event.pageY - 40 + 'px')
            .style('left', event.pageX + 10 + 'px');
        })
        .on('mouseout', (event) => {
          tooltip.style('visibility', 'hidden');
          d3.select(event.currentTarget).attr('opacity', 1);
        })
        .transition()
        .duration(600)
        .attr('y', (d) => yScale(d.rating.count))
        .attr('height', (d) =>
          Math.max(0, height - margin.bottom - yScale(d.rating.count))
        );

      return () => {
        tooltip.remove();
      };
    }
  }, [productosFiltrados, cargando]);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products?limit=20')
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setTimeout(() => setCargando(false), 1500);
      });
  }, []);

  const SkeletonCard = () => (
    <div className='bg-[#181a20] p-4 rounded-xl border border-[#2b3139] animate-pulse'>
      <div className='h-32 bg-[#2b3139] rounded-lg mb-3'></div>
      <div className='h-3 bg-[#2b3139] rounded w-3/4 mb-2'></div>
      <div className='h-3 bg-[#2b3139] rounded w-1/2'></div>
    </div>
  );

  return (
    <div className='dark min-h-screen bg-[#0b0e11] text-[#eaecef] p-4 md:p-6 font-sans'>
      {productoSeleccionado && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
          <div className='bg-[#1e2329] border border-[#474d57] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl'>
            <div className='p-6 flex flex-col md:flex-row gap-6'>
              <div className='w-full md:w-1/2 bg-white rounded-xl p-4 flex items-center justify-center'>
                <img
                  src={productoSeleccionado.image}
                  alt=''
                  className='max-h-48 object-contain'
                />
              </div>
              <div className='w-full md:w-1/2 flex flex-col'>
                <h2 className='text-xl font-bold mb-2 text-[#f0b90b]'>
                  {productoSeleccionado.title}
                </h2>
                <p className='text-[10px] text-[#848e9c] uppercase mb-4'>
                  {productoSeleccionado.category}
                </p>
                <div className='space-y-3 mb-6'>
                  <div className='flex justify-between border-b border-[#2b3139] pb-1'>
                    <span className='text-xs text-[#848e9c] font-bold'>
                      Ventas:
                    </span>
                    <span
                      className='text-xs font-bold'
                      style={{
                        color: getBinanceColor(
                          productoSeleccionado.rating.count
                        ),
                      }}>
                      {productoSeleccionado.rating.count} uds.
                    </span>
                  </div>
                  <div className='flex justify-between border-b border-[#2b3139] pb-1'>
                    <span className='text-xs text-[#848e9c] font-bold'>
                      Precio:
                    </span>
                    <span className='text-xs font-bold text-white'>
                      {euroFormatter.format(productoSeleccionado.price)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setProductoSeleccionado(null)}
                  className='mt-auto bg-[#f0b90b] text-black font-bold py-2 rounded-lg'>
                  CERRAR PANEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className='max-w-7xl mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 mb-4 items-start'>
          <div className='flex flex-col gap-2'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`bg-[#181a20] p-4 rounded-xl border border-[#2b3139] ${cargando ? 'animate-pulse' : ''}`}>
                {cargando ? (
                  <div className='space-y-2'>
                    <div className='h-2 bg-[#2b3139] rounded w-1/2'></div>
                    <div className='h-6 bg-[#2b3139] rounded w-3/4'></div>
                  </div>
                ) : (
                  <>
                    <p className='text-[9px] text-[#848e9c] font-bold uppercase tracking-tighter'>
                      {i === 0
                        ? 'VALOR TOTAL'
                        : i === 1
                          ? 'LÍDER EN VENTAS'
                          : i === 2
                            ? 'PEOR RENDIMIENTO'
                            : 'PRECIO PROMEDIO'}
                    </p>
                    <p
                      className={`text-xl font-black truncate ${i === 0 ? 'text-[#2ebd85]' : i === 1 ? 'text-[#f0b90b]' : i === 2 ? 'text-[#f6465d]' : 'text-gray-200'}`}>
                      {i === 0
                        ? euroFormatter.format(stats.valorTotal)
                        : i === 1
                          ? stats.masVendido?.title
                          : i === 2
                            ? stats.menosVendido?.title
                            : euroFormatter.format(stats.precioMedio)}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className='flex flex-col gap-4'>
            <div className='bg-[#181a20] p-5 rounded-xl border border-[#2b3139] relative h-[300px] flex flex-col shadow-md overflow-hidden'>
              <header className='flex justify-between items-center mb-2'>
                <h3 className='text-[10px] font-black text-[#848e9c] tracking-widest uppercase'>
                  VOLUMEN DE ACTIVOS
                </h3>
                <div className='flex gap-3 text-[9px] font-bold'>
                  <span className='flex items-center gap-1'>
                    <div className='w-1.5 h-1.5 bg-[#2ebd85] rounded-full'></div>{' '}
                    +500
                  </span>
                  <span className='flex items-center gap-1'>
                    <div className='w-1.5 h-1.5 bg-[#f0b90b] rounded-full'></div>{' '}
                    200-500
                  </span>
                  <span className='flex items-center gap-1'>
                    <div className='w-1.5 h-1.5 bg-[#f6465d] rounded-full'></div>{' '}
                    -200
                  </span>
                </div>
              </header>
              <div className='flex-1 w-full flex items-center justify-center'>
                {cargando ? (
                  <div className='w-full h-full flex items-end gap-2 px-6 pb-4'>
                    {[...Array(15)].map((_, i) => (
                      <div
                        key={i}
                        className='flex-1 bg-[#2b3139] animate-pulse rounded-t'
                        style={{ height: `${Math.random() * 80 + 10}%` }}></div>
                    ))}
                  </div>
                ) : productosFiltrados.length > 0 ? (
                  <svg
                    ref={svgRef}
                    viewBox='0 0 300 120'
                    preserveAspectRatio='none'
                    className='w-full h-full'></svg>
                ) : (
                  <div className='text-center py-10'>
                    <p className='text-[#f6465d] font-bold text-sm'>
                      PRODUCTO NO ENCONTRADO
                    </p>
                    <p className='text-[#848e9c] text-[10px]'>
                      Intenta con otro término de búsqueda
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className='flex flex-col gap-3'>
              <div className='flex justify-center gap-2'>
                {['todos', 'bajo', 'alto'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltroPrecio(f as any)}
                    className={`px-10 py-2 text-[10px] font-black rounded-lg border uppercase transition-all ${filtroPrecio === f ? 'bg-[#f0b90b] text-black border-[#f0b90b]' : 'bg-[#1e2329] border-[#474d57] text-[#848e9c]'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Escribe para buscar activos en el mercado...'
                  className='w-full p-4 pr-12 rounded-xl bg-[#1e2329] border border-[#474d57] outline-none focus:border-[#f0b90b] text-sm text-white placeholder:text-gray-600 shadow-inner'
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-[#848e9c] hover:text-white font-bold text-xs'>
                    BORRAR
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6'>
          {cargando
            ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            : productosFiltrados.length > 0
              ? productosFiltrados.map((p) => (
                  <div
                    key={p.id}
                    className='bg-[#181a20] border border-[#2b3139] p-4 rounded-xl flex flex-col hover:border-[#f0b90b] transition-all group'>
                    <div className='h-32 bg-white rounded-lg mb-3 flex justify-center p-3'>
                      <img
                        src={p.image}
                        className='max-h-full group-hover:scale-105 transition-transform'
                        alt=''
                      />
                    </div>
                    <div className='flex justify-between items-center mb-1'>
                      <span
                        className='text-[9px] font-black'
                        style={{ color: getBinanceColor(p.rating.count) }}>
                        {p.rating.count >= 500
                          ? '★★★ TOP'
                          : p.rating.count >= 200
                            ? '★★ MED'
                            : '★ LOW'}
                      </span>
                      <span className='text-[9px] text-[#848e9c] font-bold uppercase'>
                        VOL: {p.rating.count}
                      </span>
                    </div>
                    <h3 className='text-xs font-bold mb-4 line-clamp-2 h-8 leading-tight'>
                      {p.title}
                    </h3>
                    <div className='mt-auto pt-3 border-t border-[#2b3139] flex justify-between items-center'>
                      <span
                        className='text-base font-black'
                        style={{ color: getBinanceColor(p.rating.count) }}>
                        {euroFormatter.format(p.price)}
                      </span>
                      <button
                        onClick={() => setProductoSeleccionado(p)}
                        className='bg-[#2b3139] text-[9px] font-black px-3 py-1.5 rounded-md hover:bg-[#f0b90b] hover:text-black'>
                        INFO
                      </button>
                    </div>
                  </div>
                ))
              : null}
        </div>
      </main>
    </div>
  );
}

export default App;
