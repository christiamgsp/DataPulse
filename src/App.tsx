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

  const productosFiltrados = productos.filter((p) =>
    p.title.toLowerCase().includes(busqueda.toLowerCase())
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
        .padding(0.2);

      // Eje con color adaptado a modo oscuro
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `$${d}`);
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
        .attr('font-size', '6px')
        .attr('color', '#94a3b8'); // Color slate-400 para que se vea en oscuro

      svg
        .selectAll('rect')
        .data(productosFiltrados)
        .join('rect')
        .attr('x', (_, i) => xScale(i.toString())!)
        .attr('y', height - margin.bottom)
        .attr('height', 0)
        .attr('width', xScale.bandwidth())
        .attr('fill', (d) =>
          d.price < 100 ? '#f87171' : d.price <= 300 ? '#60a5fa' : '#4ade80'
        )
        .transition()
        .duration(500)
        .attr('y', (d) => yScale(d.price))
        .attr('height', (d) => height - margin.bottom - yScale(d.price));

      svg
        .selectAll('rect')
        .on('mouseenter', (event, d) => {
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip
            .html(
              `<strong>${d.title.substring(0, 20)}...</strong><br/>$${d.price}`
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px');
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
      `PRODUCTO: ${p.title}\n\nVendidos: ${p.rating.count}\nValoración: ${p.rating.rate}/5\n\n${p.description}`
    );
  };

  return (
    // 'dark' activa el modo oscuro para los hijos
    <div className='dark min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-500'>
      <div
        id='tooltip'
        className='absolute opacity-0 bg-slate-800 text-white p-2 rounded shadow-lg pointer-events-none text-xs z-50'></div>

      <header className='max-w-5xl mx-auto mb-8 text-center'>
        <h1 className='text-3xl font-black mb-2'>
          DataPulse <span className='text-blue-500'>Pro</span>
        </h1>
        <p className='text-slate-500 dark:text-slate-400 text-sm italic'>
          Premium Analytics Dashboard
        </p>
      </header>

      <main className='max-w-5xl mx-auto flex flex-col items-center'>
        {/* GRÁFICO MÁS PEQUEÑO */}
        <section className='w-full max-w-2xl bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 mb-6 shadow-xl'>
          <h2 className='text-sm font-bold mb-4 px-2 opacity-70'>
            Rendimiento de Precios
          </h2>
          <svg
            ref={svgRef}
            viewBox='0 0 300 150'
            className='w-full h-auto'></svg>
        </section>

        {/* BUSCADOR DEBAJO DEL GRÁFICO */}
        <div className='w-full max-w-md mb-12 relative group'>
          <input
            type='text'
            placeholder='Filtrar catálogo...'
            className='w-full p-3 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className='absolute left-3 top-3.5 opacity-40'>🔍</span>
        </div>

        {/* GRID DE PRODUCTOS */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
          {productosFiltrados.map((p) => (
            <div
              key={p.id}
              className='bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col hover:border-blue-500 transition-colors'>
              <div className='h-32 flex justify-center mb-4 bg-white rounded-lg p-2'>
                <img src={p.image} className='max-h-full' alt='' />
              </div>
              <h3 className='font-bold text-xs h-8 overflow-hidden mb-2 line-clamp-2'>
                {p.title}
              </h3>
              <div className='flex justify-between items-center mt-auto'>
                <p className='text-lg font-black text-blue-500'>${p.price}</p>
                <button
                  onClick={() => verDetalles(p)}
                  className='bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all'>
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
