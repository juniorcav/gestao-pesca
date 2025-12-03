
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LodgeConfig, Room, Boat, Guide, Product, Deal, Reservation, ConsumptionItem, BudgetItemTemplate, Business 
} from '../types';
import { INITIAL_CONFIG } from '../constants';

interface AppContextType {
  config: LodgeConfig;
  updateConfig: (config: LodgeConfig) => void;
  
  rooms: Room[];
  boats: Boat[];
  guides: Guide[];
  products: Product[];
  budgetTemplates: BudgetItemTemplate[];
  
  addResource: (type: 'room' | 'boat' | 'guide' | 'product' | 'budget_template', item: any) => void;
  updateResource: (type: 'room' | 'boat' | 'guide' | 'product' | 'budget_template', id: string, item: any) => void;
  deleteResource: (type: 'room' | 'boat' | 'guide' | 'product' | 'budget_template', id: string) => void;

  deals: Deal[];
  updateDealStage: (id: string, stage: Deal['stage']) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (deal: Deal) => void;

  reservations: Reservation[];
  addReservation: (res: Reservation) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  handleConsumption: (reservationId: string, roomId: string, productId: string, quantityDelta: number) => void;
  loadingData: boolean;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  currentBusinessId: string;

  businesses: Business[];
  addBusiness: (business: Business) => void;
  updateBusiness: (business: Business) => void;
  deleteBusiness: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Keys for LocalStorage
const KEYS = {
    CONFIG: 'pescagestor_config',
    ROOMS: 'pescagestor_rooms',
    BOATS: 'pescagestor_boats',
    GUIDES: 'pescagestor_guides',
    PRODUCTS: 'pescagestor_products',
    TEMPLATES: 'pescagestor_templates',
    DEALS: 'pescagestor_deals',
    RESERVATIONS: 'pescagestor_reservations',
    BUSINESSES: 'pescagestor_businesses',
    THEME: 'theme'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingData, setLoadingData] = useState(true);
  const currentBusinessId = 'local-business-id';

  // --- THEME ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(KEYS.THEME) as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');


  // --- DATA STATES (INITIALIZED FROM LOCAL STORAGE) ---
  const [config, setConfig] = useState<LodgeConfig>(() => {
      const saved = localStorage.getItem(KEYS.CONFIG);
      return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
      const saved = localStorage.getItem(KEYS.ROOMS);
      return saved ? JSON.parse(saved) : [];
  });

  const [boats, setBoats] = useState<Boat[]>(() => {
      const saved = localStorage.getItem(KEYS.BOATS);
      return saved ? JSON.parse(saved) : [];
  });

  const [guides, setGuides] = useState<Guide[]>(() => {
      const saved = localStorage.getItem(KEYS.GUIDES);
      return saved ? JSON.parse(saved) : [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
      const saved = localStorage.getItem(KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : [];
  });

  const [budgetTemplates, setBudgetTemplates] = useState<BudgetItemTemplate[]>(() => {
      const saved = localStorage.getItem(KEYS.TEMPLATES);
      return saved ? JSON.parse(saved) : [];
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
      const saved = localStorage.getItem(KEYS.DEALS);
      return saved ? JSON.parse(saved) : [];
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
      const saved = localStorage.getItem(KEYS.RESERVATIONS);
      return saved ? JSON.parse(saved) : [];
  });
  
  const [businesses, setBusinesses] = useState<Business[]>(() => {
      const saved = localStorage.getItem(KEYS.BUSINESSES);
      return saved ? JSON.parse(saved) : [];
  });


  // --- PERSISTENCE EFFECTS ---
  // Automatically save to LocalStorage whenever state changes
  useEffect(() => localStorage.setItem(KEYS.CONFIG, JSON.stringify(config)), [config]);
  useEffect(() => localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms)), [rooms]);
  useEffect(() => localStorage.setItem(KEYS.BOATS, JSON.stringify(boats)), [boats]);
  useEffect(() => localStorage.setItem(KEYS.GUIDES, JSON.stringify(guides)), [guides]);
  useEffect(() => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(budgetTemplates)), [budgetTemplates]);
  useEffect(() => localStorage.setItem(KEYS.DEALS, JSON.stringify(deals)), [deals]);
  useEffect(() => localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(reservations)), [reservations]);
  useEffect(() => localStorage.setItem(KEYS.BUSINESSES, JSON.stringify(businesses)), [businesses]);

  // Simulate loading time initially
  useEffect(() => {
      const timer = setTimeout(() => setLoadingData(false), 500);
      return () => clearTimeout(timer);
  }, []);


  // --- ACTIONS ---

  const updateConfig = (newConfig: LodgeConfig) => setConfig(newConfig);

  const addResource = (type: string, item: any) => {
    switch(type) {
      case 'room': setRooms(prev => [...prev, item]); break;
      case 'boat': setBoats(prev => [...prev, item]); break;
      case 'guide': setGuides(prev => [...prev, item]); break;
      case 'product': setProducts(prev => [...prev, item]); break;
      case 'budget_template': setBudgetTemplates(prev => [...prev, item]); break;
    }
  };

  const updateResource = (type: string, id: string, updatedItem: any) => {
    switch(type) {
      case 'room': setRooms(prev => prev.map(r => r.id === id ? updatedItem : r)); break;
      case 'boat': setBoats(prev => prev.map(b => b.id === id ? updatedItem : b)); break;
      case 'guide': setGuides(prev => prev.map(g => g.id === id ? updatedItem : g)); break;
      case 'product': setProducts(prev => prev.map(p => p.id === id ? updatedItem : p)); break;
      case 'budget_template': setBudgetTemplates(prev => prev.map(b => b.id === id ? updatedItem : b)); break;
    }
  };

  const deleteResource = (type: string, id: string) => {
    switch(type) {
      case 'room': setRooms(prev => prev.filter(r => r.id !== id)); break;
      case 'boat': setBoats(prev => prev.filter(b => b.id !== id)); break;
      case 'guide': setGuides(prev => prev.filter(g => g.id !== id)); break;
      case 'product': setProducts(prev => prev.filter(p => p.id !== id)); break;
      case 'budget_template': setBudgetTemplates(prev => prev.filter(b => b.id !== id)); break;
    }
  };

  const addDeal = (deal: Deal) => setDeals(prev => [...prev, deal]);
  
  const updateDeal = (deal: Deal) => setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));

  const updateDealStage = (id: string, stage: Deal['stage']) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d));
  };

  const addReservation = (res: Reservation) => setReservations(prev => [...prev, res]);

  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleConsumption = (reservationId: string, roomId: string, productId: string, quantityDelta: number) => {
    setReservations(prev => {
        const newReservations = [...prev];
        const resIndex = newReservations.findIndex(r => r.id === reservationId);
        if (resIndex === -1) return prev;

        const res = { ...newReservations[resIndex] };
        res.allocatedRooms = [...res.allocatedRooms];
        
        const roomIndex = res.allocatedRooms.findIndex(r => r.roomId === roomId);
        if (roomIndex === -1) return prev;

        const room = { ...res.allocatedRooms[roomIndex] };
        room.consumption = [...room.consumption];

        const existingItemIndex = room.consumption.findIndex(c => c.productId === productId);

        if (existingItemIndex >= 0) {
            const existingItem = room.consumption[existingItemIndex];
            const newQuantity = existingItem.quantity + quantityDelta;
            
            if (newQuantity <= 0) {
                room.consumption.splice(existingItemIndex, 1);
            } else {
                room.consumption[existingItemIndex] = {
                    ...existingItem,
                    quantity: newQuantity,
                    total: newQuantity * existingItem.unitPrice
                };
            }
        } else {
            if (quantityDelta <= 0) return prev;
            const product = products.find(p => p.id === productId);
            if (product) {
                const newItem: ConsumptionItem = {
                    id: Math.random().toString(36).substr(2, 9),
                    productId: product.id,
                    productName: product.name,
                    quantity: quantityDelta,
                    unitPrice: product.price,
                    total: product.price * quantityDelta,
                    timestamp: new Date().toISOString()
                };
                room.consumption.push(newItem);
            }
        }

        res.allocatedRooms[roomIndex] = room;
        newReservations[resIndex] = res;
        return newReservations;
    });
  };

  // --- BUSINESS MANAGEMENT ---
  const addBusiness = (business: Business) => setBusinesses(prev => [...prev, business]);
  const updateBusiness = (business: Business) => setBusinesses(prev => prev.map(b => b.id === business.id ? business : b));
  const deleteBusiness = (id: string) => setBusinesses(prev => prev.filter(b => b.id !== id));

  // Derived State Effects (Status updates)
  useEffect(() => {
    const activeRes = reservations.filter(r => r.status === 'checked-in');
    const occupiedRoomIds = new Set(activeRes.flatMap(r => r.allocatedRooms.map(ar => ar.roomId)));
    const occupiedBoatIds = new Set(activeRes.flatMap(r => r.boatIds));
    const busyGuideIds = new Set(activeRes.flatMap(r => r.guideIds));

    // We don't save status to DB/Local to avoid sync loops, just UI computation if needed.
    // However, if the UI relies on room.status being present in the object, we update it in memory only or trigger a state update.
    // The previous implementation updated the state which triggered a save loop. 
    // Ideally, 'status' should be computed on render, but for compatibility with existing components:
    
    // We update local state if it differs, but be careful not to trigger infinite loops with useEffect dependencies
    // For this LocalStorage implementation, we will skip auto-updating "status" property on the objects to avoid complexity.
    // The Dashboard computes occupancy from reservations directly.
    
  }, [reservations]);

  return (
    <AppContext.Provider value={{
      config, updateConfig,
      rooms, boats, guides, products, budgetTemplates,
      addResource, updateResource, deleteResource,
      deals, updateDealStage, addDeal, updateDeal,
      reservations, addReservation, updateReservationStatus, handleConsumption,
      loadingData,
      theme, toggleTheme,
      currentBusinessId,
      businesses, addBusiness, updateBusiness, deleteBusiness
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
