import { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

// 1. Interfaz completa y corregida
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
  const svgRef = useRef<SVGSVGElement>(null);

  // 2. Lógica de D3 (Gráfico, Escalas, Ejes e Interactividad)
  useEffect(() => {
    if (productos.length > 0 && svgRef.current) {
      const svg = d3.select(svgRef.current);
      const tooltip = d3.select('#tooltip');
      svg.selectAll('*').remove();

      const width = 300;
      const height = 150;
      const margin = { top: 20, right: 10, bottom: 40, left: 40 };

      // Escalas profesionales
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(productos, (d) => d.price) || 1000])
        .range([height - margin.bottom, margin.top]);

      const xScale = d3
        .scaleBand()
        .domain(productos.map((_, i) => i.toString()))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      // Eje Y (Precios)
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `$${d}`);
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
        .attr('font-size', '6px')
        .attr('color', '#64748b');

      // Barras con Animación
      svg
        .selectAll('rect')
        .data(productos)
        .join('rect')
        .attr('x', (_, i) => xScale(i.toString())!)
        .attr('width', xScale.bandwidth())
        .attr('fill', (d) =>
          d.price < 100 ? '#ef4444' : d.price <= 300 ? '#3b82f6' : '#22c55e'
        )
        .attr('cursor', 'pointer')
        .attr('y', height - margin.bottom)
        .attr('height', 0)
        .transition()
        .duration(800)
        .attr('y', (d) => yScale(d.price))
        .attr('height', (d) => height - margin.bottom - yScale(d.price));

      // Tooltip dinámico
      svg
        .selectAll('rect')
        .on('mouseenter', (event, d) => {
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip
            .html(
              `
            <div class="font-bold">${d.title.substring(0, 20)}...</div>
            <div class="text-blue-400">$${d.price}</div>
          `
            )
            .style('left', event.pageX + 15 + 'px')
            .style('top', event.pageY - 40 + 'px');
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', event.pageX + 15 + 'px')
            .style('top', event.pageY - 40 + 'px');
        })
        .on('mouseleave', () => {
          tooltip.transition().duration(300).style('opacity', 0);
        });

      // Etiquetas rotadas
      svg
        .selectAll('.label')
        .data(productos)
        .join('text')
        .attr('class', 'label')
        .attr('x', (_, i) => xScale(i.toString())! + xScale.bandwidth() / 2)
        .attr('y', height - margin.bottom + 5)
        .attr('transform', (_, i) => {
          const x = xScale(i.toString())! + xScale.bandwidth() / 2;
          const y = height - margin.bottom + 5;
          return `rotate(-45, ${x}, ${y})`;
        })
        .text((d) => d.title.substring(0, 5) + '...')
        .attr('font-size', '4px')
        .attr('fill', '#94a3b8');
    }
  }, [productos]);

  // 3. Carga de datos
  useEffect(() => {
    fetch('https://fakestoreapi.com/products?limit=20')
      .then((res) => res.json())
      .then((data) => setProductos(data));
  }, []);

  // 4. Diseño UI con Tailwind
  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans'>
      {/* Elemento Tooltip (Importante para D3) */}
      <div
        id='tooltip'
        className='absolute opacity-0 bg-slate-800 text-white p-3 rounded-lg shadow-2xl pointer-events-none text-xs z-50 border border-slate-700 backdrop-blur-sm'></div>

      <header className='max-w-7xl mx-auto mb-12 text-center'>
        <h1 className='text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3'>
          DataPulse <span className='text-blue-600'>Dashboard</span>
        </h1>
        <p className='text-slate-500 font-medium'>
          Análisis de inventario y métricas de mercado en tiempo real
        </p>
      </header>

      <main className='max-w-7xl mx-auto'>
        {/* Gráfico Principal */}
        <section className='bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-12'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h2 className='text-2xl font-bold text-slate-800'>
                Tendencias de Precio
              </h2>
              <p className='text-sm text-slate-500'>
                Comparativa de costos por unidad de producto
              </p>
            </div>
            <div className='flex gap-2'>
              <span className='flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded-md'>
                BAJO
              </span>
              <span className='flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md'>
                MEDIO
              </span>
              <span className='flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-md'>
                ALTO
              </span>
            </div>
          </div>
          <svg
            ref={svgRef}
            viewBox='0 0 300 150'
            className='w-full h-auto'></svg>
        </section>

        {/* Catálogo en Grid */}
        <h2 className='text-2xl font-bold text-slate-800 mb-8 px-2'>
          Catálogo de Productos
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
          {productos.map((p) => (
            <div
              key={p.id}
              className='group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col'>
              <div className='h-56 bg-white p-8 flex justify-center items-center relative overflow-hidden'>
                <div className='absolute top-4 right-4 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold shadow-sm border border-slate-100'>
                  ★ {p.rating.rate}
                </div>
                <img
                  src={p.image}
                  alt={p.title}
                  className='max-h-full group-hover:scale-110 transition-transform duration-700 ease-out'
                />
              </div>
              <div className='p-6 border-t border-slate-50 flex-grow flex flex-col'>
                <span className='text-[10px] uppercase tracking-widest text-blue-600 font-extrabold mb-1'>
                  {p.category}
                </span>
                <h3
                  className='font-bold text-slate-800 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2'
                  title={p.title}>
                  {p.title}
                </h3>
                <div className='mt-auto flex justify-between items-end'>
                  <div>
                    <p className='text-xs text-slate-400 font-medium'>
                      Precio Final
                    </p>
                    <p className='text-2xl font-black text-slate-900'>
                      ${p.price}
                    </p>
                  </div>
                  <button className='bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors'>
                    Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className='max-w-7xl mx-auto mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-sm'>
        &copy; 2026 DataPulse Analytics. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default App;
