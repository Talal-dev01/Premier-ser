// API service for handling backend requests
  
export const fetchSavedProperties = async () => {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};
  
export const deleteSavedProperty = async (cmsId) => {
  try {
    const response = await fetch('/api/delete-saved-item', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cmsId }),
    });
    
    if (!response.ok) {
      throw new Error('Delete request failed');
    }
    
    const data = await response.json();
    console.log('Delete response:', data);
    return data;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};