import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { apiService, stylistService } from '../services/api';

const SelectorContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CategoryCard = styled(motion.div)`
  background: ${props => props.selected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff'};
  border: 2px solid ${props => props.selected ? '#667eea' : '#e5e7eb'};
  border-radius: 1rem;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.selected ? '0 10px 25px rgba(102, 126, 234, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
  }
  
  .category-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    display: block;
  }
  
  .category-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${props => props.selected ? '#ffffff' : '#374151'};
    margin: 0;
  }
`;

const ClothingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const ClothingItem = styled(motion.div)`
  background: #ffffff;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e5e7eb'};
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.selected ? '0 8px 20px rgba(102, 126, 234, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
  }
  
  .item-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #9ca3af;
  }
  
  .item-info {
    padding: 0.75rem;
  }
  
  .item-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
  }
  
  .item-details {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }
  
  .selected-indicator {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: #667eea;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 1rem;
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 1rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  
  .loading-spinner {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

const ClothingSelector = ({ onClothingSelect, selectedClothing = null }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [clothingItems, setClothingItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
    loadClothingItems();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchClothing();
    } else {
      loadClothingItems();
    }
  }, [searchQuery, selectedCategory]);

  const loadCategories = async () => {
    try {
      const categories = await apiService.getClothingCategories();
      setCategories(categories);
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load clothing categories');
    }
  };

  const loadClothingItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stylistService.getClothingItems();
      if (response.success) {
        let items = response.items;
        
        // Filter by category if selected
        if (selectedCategory) {
          items = items.filter(item => 
            item.category.toLowerCase() === selectedCategory.toLowerCase() ||
            item.category.toLowerCase().includes(selectedCategory.toLowerCase())
          );
        }
        
        setClothingItems(items);
      } else {
        throw new Error(response.error || 'Failed to load clothing items');
      }
    } catch (error) {
      console.error('Failed to load clothing items:', error);
      setError('Failed to load clothing items');
      setClothingItems([]);
    } finally {
      setLoading(false);
    }
  };

  const searchClothing = async () => {
    if (!searchQuery.trim()) {
      loadClothingItems();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await stylistService.searchClothing(
        searchQuery,
        { style_preference: selectedCategory },
        20
      );
      
      if (response.success) {
        let items = response.items;
        
        // Filter by category if selected
        if (selectedCategory) {
          items = items.filter(item => 
            item.category.toLowerCase() === selectedCategory.toLowerCase() ||
            item.category.toLowerCase().includes(selectedCategory.toLowerCase())
          );
        }
        
        setClothingItems(items);
      } else {
        throw new Error(response.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed');
      setClothingItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // Clear search when switching categories
  };

  const handleClothingSelect = (item) => {
    onClothingSelect(item);
  };

  const getItemImage = (item) => {
    // Return placeholder or actual image
    return item.image_path && item.image_path !== 'public/images/placeholder.jpg' 
      ? `http://localhost:8000/${item.image_path}` 
      : null;
  };

  return (
    <SelectorContainer>
      {/* Category Selection */}
      <CategoryGrid>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            selected={selectedCategory === category.id}
            onClick={() => handleCategorySelect(category.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="category-icon">{category.icon}</span>
            <h3 className="category-name">{category.name}</h3>
          </CategoryCard>
        ))}
      </CategoryGrid>

      {/* Search Box */}
      <SearchBox>
        <i className="fas fa-search search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${selectedCategory ? categories.find(c => c.id === selectedCategory)?.name.toLowerCase() : 'clothing'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBox>

      {/* Clothing Items Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingState key="loading">
            <i className="fas fa-spinner loading-spinner" />
            Loading clothing items...
          </LoadingState>
        ) : error ? (
          <EmptyState key="error">
            <i className="fas fa-exclamation-triangle empty-icon" />
            <p>{error}</p>
          </EmptyState>
        ) : clothingItems.length === 0 ? (
          <EmptyState key="empty">
            <i className="fas fa-tshirt empty-icon" />
            <p>No clothing items found</p>
          </EmptyState>
        ) : (
          <ClothingGrid key="items">
            {clothingItems.map((item, index) => (
              <ClothingItem
                key={item.id}
                selected={selectedClothing?.id === item.id}
                onClick={() => handleClothingSelect(item)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedClothing?.id === item.id && (
                  <div className="selected-indicator">
                    <i className="fas fa-check" />
                  </div>
                )}
                
                <div className="item-image">
                  {getItemImage(item) ? (
                    <img 
                      src={getItemImage(item)} 
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ display: getItemImage(item) ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <i className="fas fa-tshirt" />
                  </div>
                </div>
                
                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-details">
                    {item.color} {item.fabric}
                  </p>
                </div>
              </ClothingItem>
            ))}
          </ClothingGrid>
        )}
      </AnimatePresence>
    </SelectorContainer>
  );
};

export default ClothingSelector;