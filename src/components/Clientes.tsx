import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Interfaces (puedes moverlas a un archivo types.ts si prefieres)
interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
}

interface ClienteFormData {
  nombre: string;
  email: string;
  telefono: string;
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // URL de la API
  const API_BASE_URL = '/api/api/clientes';

  // Cargar clientes al iniciar
  useEffect(() => {
    fetchClientes();
  }, []);

  //Obtener todos los clientes
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (response.ok) {
        const data = await response.json();
        setClientes(data.records || []);
      } else {
        console.error('Error al cargar clientes');
        setClientes([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo conectar con el servidor',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Crear cliente
  const createCliente = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchClientes();
        clearForm();
        Swal.fire({
          title: '¡Éxito!',
          text: 'Cliente creado correctamente',
          icon: 'success',
          timer: 2000
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: 'Error',
          text: errorData.message || 'Error al crear cliente',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error de conexión al crear cliente',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cliente
  const updateCliente = async () => {
    if (!editingId) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchClientes();
        clearForm();
        Swal.fire({
          title: '¡Éxito!',
          text: 'Cliente actualizado correctamente',
          icon: 'success',
          timer: 2000
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: 'Error',
          text: errorData.message || 'Error al actualizar cliente',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error de conexión al actualizar cliente',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cliente
  const deleteCliente = async (id: number, nombre: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al cliente "${nombre}"?`,
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
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchClientes();
          Swal.fire({
            title: '¡Eliminado!',
            text: 'Cliente eliminado correctamente',
            icon: 'success',
            timer: 2000
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Error al eliminar cliente',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error de conexión al eliminar cliente',
          icon: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Editar cliente
  const editCliente = (cliente: Cliente) => {
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono
    });
    setIsEditing(true);
    setEditingId(cliente.id);
    
    // Scroll al formulario
    const formSection = document.getElementById('form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Limpiar formulario
  const clearForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateCliente();
    } else {
      createCliente();
    }
  };

  return (
    <>
      {/* Sección del título */}
      <header className="header">
        <h1>Administración de Clientes</h1>
        <div className="header-line"></div>
      </header>

      {/* Sección del formulario */}
      <section id="form-section" className="form-section">
        <div className="container">
          <div className="form-card">
            <h2>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            
            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre Completo</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ingresa el nombre completo"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="123-456-7890"
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button 
                  type="submit" 
                  className={`btn ${isEditing ? 'btn-update' : 'btn-create'}`}
                  disabled={loading}
                >
                  {loading ? '⏳' : isEditing ? '✏️ Actualizar' : '➕ Crear'}
                </button>
                
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn btn-cancel"
                    onClick={clearForm}
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Sección de la lista */}
       <section className="list-section">
        <div className="container">
          <div className="list-header">
            <h2>Lista de Clientes</h2>
            <span className="client-count">
              {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando...</p>
            </div>
          )}

          <div className="clients-table-container">
            {clientes.length === 0 && !loading ? (
              <div className="no-clients">
                <div className="no-clients-icon">👥</div>
                <h3>No hay clientes registrados</h3>
                <p>Agrega tu primer cliente usando el formulario de arriba</p>
              </div>
            ) : (
              <div className="clients-table-card">
                <div className="table-responsive">
                  <table className="clients-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map((cliente) => (
                        <tr key={cliente.id} className="client-row">
                          <td className="client-id">
                            <span className="id-badge">{cliente.id}</span>
                          </td>
                          <td className="client-name">
                            <div className="name-container">
                              <span className="name-icon">👤</span>
                              <span className="name-text">{cliente.nombre}</span>
                            </div>
                          </td>
                          <td className="client-email">
                            <div className="email-container">
                              <span className="email-icon">📧</span>
                              <span className="email-text">{cliente.email}</span>
                            </div>
                          </td>
                          <td className="client-phone">
                            <div className="phone-container">
                              {cliente.telefono ? (
                                <>
                                  <span className="phone-icon">📞</span>
                                  <span className="phone-text">{cliente.telefono}</span>
                                </>
                              ) : (
                                <span className="no-phone">Sin teléfono</span>
                              )}
                            </div>
                          </td>
                          <td className="">
                            <div className="actions-container">
                              <button
                                className="btn-action btn-edit"
                                onClick={() => editCliente(cliente)}
                                title="Editar cliente"
                              >
                                ✏️
                              </button>
                              
                              <button
                                className="btn-action btn-delete"
                                onClick={() => deleteCliente(cliente.id, cliente.nombre)}
                                title="Eliminar cliente"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Clientes;