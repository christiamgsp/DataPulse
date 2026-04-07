import { useEffect, useState } from 'react';

// 1. Definimos el "molde" de lo que viene de la API
interface Producto {
  id: number;
  title: string;
  price: number;
  category: string;
}

function App() {
  // 2. Creamos la "caja" (estado) para guardar los productos
  // Empezamos con un array vacío []
  const [productos, setProductos] = useState<Producto[]>([]);

  // 3. El Hook que se ejecuta al cargar la página
  useEffect(() => {
    // Pedimos los datos a la FakeStore API
    fetch('https://fakestoreapi.com/products?limit=5')
      .then((res) => res.json()) // Convertimos la respuesta a JSON
      .then((data) => {
        console.log('Datos recibidos:', data); // Los vemos en la consola
        setProductos(data); // Guardamos los datos en nuestra caja
      });
  }, []); // El [] vacío significa: "Hazlo solo una vez al empezar"

  return (
    <div className='min-h-screen bg-slate-900 text-white p-8'>
      <h1 className='text-3xl text-center mb-8 text-blue-400 font-bold'>
        DataPulse Dashboard
      </h1>

      <div className='grid grid-cols-1 gap-4 max-w-2xl mx-auto'>
        {/* Usamos el .map que ya dominas para mostrar los títulos */}
        {productos.map((p) => (
          <div
            key={p.id}
            className='bg-slate-800 p-4 rounded-lg shadow-md border border-slate-700'>
            <p className='font-bold text-lg'>{p.title}</p>
            <p className='text-blue-400 font-mono'>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
