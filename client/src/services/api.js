// API service for handling backend requests

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:5000/api';

export const fetchSavedProperties = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  };
  
  export const deleteSavedProperty = async (cmsId) => {
    try {
      const response = await fetch(`${API_BASE}/delete-saved-item`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cmsId }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };