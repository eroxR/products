import React, { useState, useEffect  } from 'react';
import './index.css'; // Asegúrate que la ruta al CSS es correcta

// Importa los componentes de cada sección
import Clientes from './components/Clientes';
import Pedidos from './components/Pedidos';
import Productos from './components/Productos';
import DetallePedidos from './components/DetallePedidos';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('clientes');

  const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
    const handleScroll = () => {
      // Si el scroll vertical es mayor a 10px, activamos el estado
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Añadimos el listener cuando el componente se monta
    window.addEventListener('scroll', handleScroll);

    // Limpiamos el listener cuando el componente se desmonta para evitar fugas de memoria
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); 


  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Función para renderizar el componente de la sección activa
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'clientes':
        return <Clientes />;
      case 'pedidos':
        return <Pedidos />;
      case 'productos':
        return <Productos />;
      case 'detalle-pedidos':
        return <DetallePedidos />;
      default:
        return <Clientes />;
    }
  };

  return (
    <div className="app">
      {/* Barra de navegación */}
      <nav className={`navigation-bar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="nav-buttons">
            <button
              className={`nav-btn ${activeSection === 'clientes' ? 'active' : ''}`}
              onClick={() => handleSectionChange('clientes')}
            >
              👥 Clientes
            </button>
            
            <button
              className={`nav-btn ${activeSection === 'pedidos' ? 'active' : ''}`}
              onClick={() => handleSectionChange('pedidos')}
            >
              📋 Pedidos
            </button>
            
            <button
              className={`nav-btn ${activeSection === 'productos' ? 'active' : ''}`}
              onClick={() => handleSectionChange('productos')}
            >
              📦 Productos
            </button>
            
            <button
              className={`nav-btn ${activeSection === 'detalle-pedidos' ? 'active' : ''}`}
              onClick={() => handleSectionChange('detalle-pedidos')}
            >
              📝 Detalle Pedidos
            </button>
          </div>
        </div>
      </nav>

      {/* Renderiza el componente de la sección activa */}
      <main>
        {renderActiveSection()}
      </main>

    </div>
  );
};

export default App;