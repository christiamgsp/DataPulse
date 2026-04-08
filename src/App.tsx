import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

interface Producto {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const productosFiltrados = productos.filter(
    (p) =>
      p.title.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.category.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    if (productosFiltrados.length > 0 && svgRef.current) {
      const svg = d3.select(svgRef.current);
      const tooltip = d3.select('#tooltip');
      svg.selectAll('*').remove();

      const width = 300;
      const height = 150;
      const margin = { top: 20, right: 10, bottom: 40, left: 40 };

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(productosFiltrados, (d) => d.price) || 1000])
        .range([height - margin.bottom, margin.top]);

      const xScale = d3
        .scaleBand()
        .domain(productosFiltrados.map((_, i) => i.toString()))
        .range([margin.left, width - margin.right])
        .padding(0.3);

      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `$${d}`);
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
        .attr('font-size', '6px')
        .attr('color', '#848e9c'); // Gris de Binance para los ejes

      svg
        .selectAll('rect')
        .data(productosFiltrados)
        .join('rect')
        .attr('x', (_, i) => xScale(i.toString())!)
        .attr('width', xScale.bandwidth())
        // Colores de velas de Exchange: Rojo Binance y Verde Binance
        .attr('fill', (d) =>
          d.price < 100 ? '#f6465d' : d.price <= 300 ? '#F0B90B' : '#0ecb81'
        )
        .attr('y', height - margin.bottom)
        .attr('height', 0)
        .transition()
        .duration(600)
        .attr('y', (d) => yScale(d.price))
        .attr('height', (d) => height - margin.bottom - yScale(d.price));

      svg
        .selectAll('rect')
        .on('mouseenter', (event, d) => {
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip
            .html(
              `<strong>${d.title.substring(0, 20)}...</strong><br/><span style="color:#F0B90B">$${d.price}</span>`
            )
            .style('left', event.pageX + 15 + 'px')
            .style('top', event.pageY - 40 + 'px');
        })
        .on('mouseleave', () => tooltip.style('opacity', 0));
    }
  }, [productosFiltrados]);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products?limit=20')
      .then((res) => res.json())
      .then((data) => setProductos(data));
  }, []);

  const verDetalles = (p: Producto) => {
    alert(
      `DETALLES BINANCE-STYLE:\n\n${p.title}\nVolumen: ${p.rating.count}\nScore: ${p.rating.rate}\n\n${p.description.substring(0, 100)}...`
    );
  };

  return (
    // CAMBIO A COLORES BINANCE: dark:bg-[#0b0e11] (Fondo) y acentos en #F0B90B (Amarillo)
    <div className='dark min-h-screen bg-cyan-50/30 dark:bg-[#0b0e11] text-[#1e2329] dark:text-[#eaecef] p-4 md:p-8 font-sans transition-colors'>
      <div
        id='tooltip'
        className='absolute opacity-0 bg-[#1e2329] text-white p-2 rounded shadow-2xl pointer-events-none text-[10px] z-50 border border-[#474d57]'></div>

      <header className='max-w-6xl mx-auto mb-8 flex flex-col items-center'>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>
          DataPulse <span className='text-[#F0B90B]'>Exchange</span>
        </h1>
        <div className='h-1 w-12 bg-[#F0B90B] rounded-full'></div>
      </header>

      <main className='max-w-6xl mx-auto flex flex-col items-center'>
        {/* Gráfico Estilo Binance */}
        <section className='w-full max-w-2xl bg-white dark:bg-[#181a20] p-6 rounded-xl border border-slate-200 dark:border-[#2b3139] mb-6 shadow-sm'>
          <h2 className='text-xs font-bold mb-4 uppercase tracking-widest text-[#848e9c]'>
            Market Overview
          </h2>
          {productosFiltrados.length > 0 ? (
            <svg
              ref={svgRef}
              viewBox='0 0 300 150'
              className='w-full h-auto'></svg>
          ) : (
            <div className='h-[150px] flex items-center justify-center text-[#848e9c] text-xs'>
              Waiting for data...
            </div>
          )}
        </section>

        {/* Buscador Binance-Style */}
        <div className='w-full max-w-md mb-10 relative'>
          <input
            type='text'
            placeholder='Search coin or category...'
            className='w-full p-3 pl-10 rounded-lg border border-slate-200 dark:border-[#2b3139] bg-white dark:bg-[#2b3139] focus:border-[#F0B90B] outline-none transition-all text-sm'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className='absolute left-3 top-3 opacity-40'>🔍</span>
        </div>

        {/* Grid de Productos */}
        {productosFiltrados.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full'>
            {productosFiltrados.map((p) => (
              <div
                key={p.id}
                className='bg-white dark:bg-[#1e2329] border border-slate-100 dark:border-[#2b3139] p-4 rounded-lg hover:border-[#F0B90B] transition-all flex flex-col'>
                <div className='h-32 bg-white rounded-md mb-4 p-4 flex justify-center'>
                  <img src={p.image} alt='' className='max-h-full' />
                </div>
                <h3 className='font-semibold text-xs mb-2 line-clamp-1'>
                  {p.title}
                </h3>
                <div className='flex justify-between items-center mt-auto'>
                  <span className='text-lg font-bold text-[#0ecb81]'>
                    ${p.price}
                  </span>
                  <button
                    onClick={() => verDetalles(p)}
                    className='bg-slate-100 dark:bg-[#2b3139] text-[10px] font-bold px-3 py-1.5 rounded hover:bg-[#F0B90B] hover:text-black transition-all'>
                    TRADE
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State con imagen/emoji */
          <div className='flex flex-col items-center py-20 opacity-50'>
            <span className='text-6xl mb-4'>📭</span>
            <p className='text-sm font-medium'>
              No matches found for "{busqueda}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
