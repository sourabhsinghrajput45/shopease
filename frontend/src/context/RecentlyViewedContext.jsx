import { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext(null);

export function RecentlyViewedProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recently_viewed')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('recently_viewed', JSON.stringify(items));
  }, [items]);

  const addViewed = (product) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== product.id);
      return [product, ...filtered].slice(0, 6);
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ items, addViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
