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
      const response = await fetchSavedProperties();
      console.log('Raw response:', response);
      
      // Check if response is array
      const data = Array.isArray(response) ? response : [];
      console.log('Processed data:', data);
      
      setProperties(data);
      setError(null);
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  console.log('Properties:', properties);

  const handleDelete = async (cmsId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        // Immediately remove from UI
        setProperties(prevProperties => 
          prevProperties.filter(prop => prop.id !== cmsId)
        );
  
        // Then handle server deletion
        const result = await deleteSavedProperty(cmsId);
        
        if (!result.success) {
          // Revert UI if server deletion fails
          const response = await fetchSavedProperties();
          setProperties(response);
          setError('Failed to delete property');
        }
      } catch (err) {
        console.error('Delete error:', err);
        // Refresh properties from server on error
        const response = await fetchSavedProperties();
        setProperties(response);
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