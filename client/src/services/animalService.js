const API_URL = 'http://localhost:5000/api/animals';

// Get all animal categories
export const getAllCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/categories`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
    return data;
  } catch (error) {
    console.error('animalService.getAllCategories error:', error);
    throw error;
  }
};

// Create a new animal category
export const createCategory = async (categoryData) => {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create category');
    return data;
  } catch (error) {
    console.error('animalService.createCategory error:', error);
    throw error;
  }
};

// Update an animal category
export const updateCategory = async (id, categoryData) => {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update category');
    return data;
  } catch (error) {
    console.error('animalService.updateCategory error:', error);
    throw error;
  }
};

// Delete an animal category
export const deleteCategory = async (id) => {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete category');
    return data;
  } catch (error) {
    console.error('animalService.deleteCategory error:', error);
    throw error;
  }
};

// Get all registered animals
export const getAllAnimals = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}?${query}` : API_URL;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch animals');
    return data;
  } catch (error) {
    console.error('animalService.getAllAnimals error:', error);
    throw error;
  }
};

// Create a new animal
export const createAnimal = async (animalData) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(animalData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to register animal');
    return data;
  } catch (error) {
    console.error('animalService.createAnimal error:', error);
    throw error;
  }
};

// Update an animal
export const updateAnimal = async (id, animalData) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(animalData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update animal');
    return data;
  } catch (error) {
    console.error('animalService.updateAnimal error:', error);
    throw error;
  }
};

// Delete an animal
export const deleteAnimal = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete animal');
    return data;
  } catch (error) {
    console.error('animalService.deleteAnimal error:', error);
    throw error;
  }
};
