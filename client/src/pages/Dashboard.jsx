import { useState, useEffect } from 'react';
import { fetchSavedProperties, deleteSavedProperty } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await fetchSavedProperties();
      setProperties(data.items || []);
      setError(null);
    } catch (err) {
      setError('Failed to load properties');
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cmsId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const result = await deleteSavedProperty(cmsId);
        if (result.success) {
          setProperties(properties.filter(prop => prop.id !== cmsId));
        }
      } catch (err) {
        setError('Failed to delete property');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>Saved Properties</h1>
      <div className="properties-count">
        Total Properties: {properties.length}
      </div>
      <div className="properties-grid">
        {properties.map(property => (
          <div key={property.id} className="property-card">
            {property.fieldData.images && (
              <img
                src={property.fieldData.images.url}
                alt={property.fieldData.name || 'Property'}
                className="property-image"
              />
            )}
            <div className="property-details">
              <h3>{property.fieldData.name || 'Untitled Property'}</h3>
              <p>{property.fieldData['user-email']}</p>
              <p>{property.fieldData['user-name']}</p>
              <button 
                onClick={() => handleDelete(property.id)}
                className="delete-button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;