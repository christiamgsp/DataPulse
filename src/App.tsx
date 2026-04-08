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
  const [busqueda, setBusqueda] = useState(''); // Estado para el buscador
  const svgRef = useRef<SVGSVGElement>(null);

  // Lógica de filtrado: Se ejecuta cada vez que 'busqueda' o 'productos' cambian
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

      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `$${d}`);
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
        .attr('font-size', '6px');

      svg
        .selectAll('rect')
        .data(productosFiltrados)
        .join('rect')
        .attr('x', (_, i) => xScale(i.toString())!)
        .attr('y', height - margin.bottom)
        .attr('height', 0)
        .attr('width', xScale.bandwidth())
        .attr('fill', (d) =>
          d.price < 100 ? '#ef4444' : d.price <= 300 ? '#3b82f6' : '#22c55e'
        )
        .transition()
        .duration(500)
        .attr('y', (d) => yScale(d.price))
        .attr('height', (d) => height - margin.bottom - yScale(d.price));

      // Tooltip interactivo
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

  // Función para mostrar detalles (esto lo podrías convertir en un Modal mañana)
  const verDetalles = (p: Producto) => {
    alert(`
      PRODUCTO: ${p.title}
      ---------------------------
      ESTADÍSTICAS:
      - Unidades vendidas: ${p.rating.count}
      - Valoración: ${p.rating.rate} / 5
      - Descripción: ${p.description.substring(0, 100)}...
    `);
  };

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8'>
      <div
        id='tooltip'
        className='absolute opacity-0 bg-slate-800 text-white p-2 rounded shadow-lg pointer-events-none text-xs z-50'></div>

      <header className='max-w-7xl mx-auto mb-10 text-center'>
        <h1 className='text-4xl font-black text-slate-900 mb-6'>
          DataPulse <span className='text-blue-600'>Pro</span>
        </h1>

        {/* BUSCADOR */}
        <div className='max-w-md mx-auto relative'>
          <input
            type='text'
            placeholder='Buscar producto por nombre...'
            className='w-full p-4 pl-12 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className='absolute left-4 top-4 opacity-30'>🔍</span>
        </div>
      </header>

      <main className='max-w-7xl mx-auto'>
        {/* Gráfico que reacciona a la búsqueda */}
        <section className='bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10'>
          <h2 className='text-lg font-bold mb-4'>Análisis del Filtro Actual</h2>
          <svg
            ref={svgRef}
            viewBox='0 0 300 150'
            className='w-full h-auto'></svg>
        </section>

        {/* Grid de productos filtrados */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {productosFiltrados.map((p) => (
            <div
              key={p.id}
              className='bg-white rounded-2xl border border-slate-200 p-4 flex flex-col hover:shadow-xl transition-all group'>
              <div className='h-40 flex justify-center mb-4'>
                <img
                  src={p.image}
                  className='max-h-full group-hover:scale-110 transition-transform'
                  alt=''
                />
              </div>
              <h3 className='font-bold text-sm h-10 overflow-hidden mb-2'>
                {p.title}
              </h3>
              <div className='flex justify-between items-end mt-auto'>
                <p className='text-xl font-black'>${p.price}</p>
                <button
                  onClick={() => verDetalles(p)}
                  className='bg-blue-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors'>
                  DETALLES
                </button>
              </div>
            </div>
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <p className='text-center text-slate-400 mt-10'>
            No se encontraron productos con ese nombre.
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
