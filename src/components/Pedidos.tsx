import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Interfaces basadas en tu API de Pedidos
interface ClienteInfo {
  nombre: string;
  email: string;
}

interface Pedido {
  id: number;
  cliente_id: number;
  fecha_pedido: string;
  cliente: ClienteInfo; // Objeto anidado según tu API
}

interface PedidoFormData {
  cliente_id: string; // Se maneja como string en el formulario
  fecha_pedido: string;
}

// Interfaz auxiliar para la lista de clientes del formulario
interface ClienteParaSelect {
    id: number;
    nombre: string;
}

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<ClienteParaSelect[]>([]); // Para el <select>
  const [formData, setFormData] = useState<PedidoFormData>({
    cliente_id: '',
    fecha_pedido: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // URL de las APIs
  const API_PEDIDOS_URL = '/api/api/pedidos';
  const API_CLIENTES_URL = '/api/api/clientes';

  // Cargar pedidos y clientes al iniciar
  useEffect(() => {
    fetchPedidos();
    fetchClientesParaSelect();
  }, []);

  // Obtener todos los pedidos
  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_PEDIDOS_URL);
      if (response.ok) {
        const data = await response.json();
        setPedidos(data.records || []);
      } else {
        console.error('Error al cargar pedidos');
        setPedidos([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      Swal.fire('Error', 'No se pudo conectar con el servidor para cargar pedidos', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Obtener clientes para llenar el menú desplegable del formulario
  const fetchClientesParaSelect = async () => {
    try {
        const response = await fetch(API_CLIENTES_URL);
        if (response.ok) {
            const data = await response.json();
            setClientes(data.records || []);
        } else {
            console.error('Error al cargar la lista de clientes');
        }
    } catch (error) {
        console.error('Error de conexión al cargar clientes:', error);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Crear pedido
  const createPedido = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_PEDIDOS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            cliente_id: parseInt(formData.cliente_id) // Asegurar que sea número
        }),
      });

      if (response.ok) {
        await fetchPedidos();
        clearForm();
        Swal.fire('¡Éxito!', 'Pedido creado correctamente', 'success');
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.message || 'Error al crear el pedido', 'error');
      }
    } catch (error) {
        console.error('Error:', error);
      Swal.fire('Error', 'Error de conexión al crear el pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar pedido
  const updatePedido = async () => {
    if (!editingId) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_PEDIDOS_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            cliente_id: parseInt(formData.cliente_id)
        }),
      });

      if (response.ok) {
        await fetchPedidos();
        clearForm();
        Swal.fire('¡Éxito!', 'Pedido actualizado correctamente', 'success');
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.message || 'Error al actualizar el pedido', 'error');
      }
    } catch (error) {
        console.error('Error:', error);
      Swal.fire('Error', 'Error de conexión al actualizar el pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar pedido
  const deletePedido = async (id: number, clienteNombre: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el pedido #${id} del cliente "${clienteNombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await fetch(`${API_PEDIDOS_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await fetchPedidos();
          Swal.fire('¡Eliminado!', 'Pedido eliminado correctamente.', 'success');
        } else {
          Swal.fire('Error', 'Error al eliminar el pedido', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'Error de conexión al eliminar el pedido', 'error');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Preparar formulario para edición
  const editPedido = (pedido: Pedido) => {
    setIsEditing(true);
    setEditingId(pedido.id);
    setFormData({
        cliente_id: pedido.cliente_id.toString(),
        fecha_pedido: pedido.fecha_pedido.split(' ')[0], // Tomar solo la fecha YYYY-MM-DD
    });
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Limpiar formulario
  const clearForm = () => {
    setFormData({ cliente_id: '', fecha_pedido: '' });
    setIsEditing(false);
    setEditingId(null);
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updatePedido();
    } else {
      createPedido();
    }
  };

  return (
    <>
      <header className="header">
        <h1>Administración de Pedidos</h1>
        <div className="header-line"></div>
      </header>

      <section id="form-section" className="form-section">
        <div className="container">
          <div className="form-card">
            <h2>{isEditing ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-row">
                <div className="form-group select-wrapper">
                  <label htmlFor="cliente_id">Cliente</label>
                  <select
                    id="cliente_id"
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Selecciona un cliente</option>
                    {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                        </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="fecha_pedido">Fecha del Pedido</label>
                  <input
                    type="date"
                    id="fecha_pedido"
                    name="fecha_pedido"
                    value={formData.fecha_pedido}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className={`btn ${isEditing ? 'btn-update' : 'btn-create'}`} disabled={loading}>
                  {loading ? '⏳' : isEditing ? '✏️ Actualizar' : '➕ Crear'}
                </button>
                {isEditing && (
                  <button type="button" className="btn btn-cancel" onClick={clearForm}>
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="list-section">
        <div className="container">
          <div className="list-header">
            <h2>Lista de Pedidos</h2>
            <span className="client-count">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}</span>
          </div>
          {loading && (
            <div className="loading"><div className="spinner"></div><p>Cargando...</p></div>
          )}
          <div className="clients-table-container">
            {pedidos.length === 0 && !loading ? (
              <div className="no-clients">
                <div className="no-clients-icon">📋</div>
                <h3>No hay pedidos registrados</h3>
                <p>Crea tu primer pedido usando el formulario de arriba</p>
              </div>
            ) : (
              <div className="clients-table-card">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>ID Pedido</th>
                      <th>Cliente</th>
                      <th>Email Cliente</th>
                      <th>Fecha Pedido</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map(pedido => (
                      <tr key={pedido.id}>
                        <td><span className="id-badge">{pedido.id}</span></td>
                        <td className="client-name">{pedido.cliente.nombre}</td>
                        <td className="client-email">{pedido.cliente.email}</td>
                        <td>{new Date(pedido.fecha_pedido).toLocaleDateString()}</td>
                        <td>
                          <div className="actions-container">
                            <button className="btn-action btn-edit" title="Editar pedido" onClick={() => editPedido(pedido)}>✏️</button>
                            <button className="btn-action btn-delete" title="Eliminar pedido" onClick={() => deletePedido(pedido.id, pedido.cliente.nombre)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pedidos;