
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LodgeConfig, Room, Boat, Guide, Product, Deal, Reservation, ConsumptionItem, BudgetItemTemplate 
} from '../types';
import { 
  INITIAL_CONFIG 
} from '../constants';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

interface AppContextType {
  config: LodgeConfig;
  updateConfig: (config: LodgeConfig) => void;
  
  rooms: Room[];
  boats: Boat[];
  guides: Guide[];
  products: Product[];
  budgetTemplates: BudgetItemTemplate[];
  
  // Generic resource updaters
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

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  currentBusinessId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [loadingData, setLoadingData] = useState(true);

  // Determine current business ID based on logged user
  // For standard business users, it's their businessId. 
  // For fallback, we use their user ID if businessId isn't set yet.
  const currentBusinessId = user?.businessId || user?.id || '';

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [config, setConfig] = useState<LodgeConfig>(INITIAL_CONFIG);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [budgetTemplates, setBudgetTemplates] = useState<BudgetItemTemplate[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Tables mapping
  const TABLES = {
     room: 'rooms',
     boat: 'boats',
     guide: 'guides',
     product: 'products',
     budget_template: 'budget_templates',
     deal: 'deals',
     reservation: 'reservations'
  };

  // Safety Timeout
  useEffect(() => {
    if (loadingData && isAuthenticated) {
        const timer = setTimeout(() => {
            if (loadingData) {
                console.warn("Data loading timed out (3s). Forcing UI render.");
                setLoadingData(false);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [loadingData, isAuthenticated]);

  // Fetch all data on mount or user change
  useEffect(() => {
    if (!isAuthenticated || !currentBusinessId) {
        setLoadingData(false);
        return;
    }

    const fetchAllData = async () => {
        setLoadingData(true);
        
        try {
            // Fetch Config
            const { data: settingsData, error: settingsError } = await supabase
                .from('business_settings')
                .select('config')
                .eq('user_id', currentBusinessId) // Using tenant ID
                .limit(1).single();
                
            if (!settingsError && settingsData) setConfig(settingsData.config);
            else setConfig(INITIAL_CONFIG);

            // Helper to fetch generic table data
            const fetchData = async (table: string) => {
                const { data, error } = await supabase
                    .from(table)
                    .select('data')
                    .eq('user_id', currentBusinessId); 
                    
                if (error) throw error;
                return data ? data.map((r: any) => r.data) : [];
            };

            const [
                roomsData, boatsData, guidesData, productsData, templatesData, dealsData, resData
            ] = await Promise.all([
                fetchData('rooms').catch(() => []),
                fetchData('boats').catch(() => []),
                fetchData('guides').catch(() => []),
                fetchData('products').catch(() => []),
                fetchData('budget_templates').catch(() => []),
                fetchData('deals').catch(() => []),
                fetchData('reservations').catch(() => [])
            ]);

            setRooms(roomsData);
            setBoats(boatsData);
            setGuides(guidesData);
            setProducts(productsData);
            setBudgetTemplates(templatesData);
            setDeals(dealsData);
            setReservations(resData);

        } catch (error) {
            console.error("Error fetching data (or offline):", error);
        } finally {
            setLoadingData(false);
        }
    };

    fetchAllData();
  }, [isAuthenticated, currentBusinessId]);

  const updateConfig = async (newConfig: LodgeConfig) => {
     if (!currentBusinessId) return;
     setConfig(newConfig);
     try {
         const { data } = await supabase.from('business_settings').select('id').eq('user_id', currentBusinessId).limit(1);
         if (data && data.length > 0) {
            await supabase.from('business_settings').update({ config: newConfig }).eq('id', data[0].id);
         } else {
            await supabase.from('business_settings').insert({ config: newConfig, user_id: currentBusinessId });
         }
     } catch (err) {
         console.warn("Offline Mode: Config updated locally only.");
     }
  };

  const addResource = async (type: string, item: any) => {
    if (!currentBusinessId) return;
    switch(type) {
      case 'room': setRooms([...rooms, item]); break;
      case 'boat': setBoats([...boats, item]); break;
      case 'guide': setGuides([...guides, item]); break;
      case 'product': setProducts([...products, item]); break;
      case 'budget_template': setBudgetTemplates([...budgetTemplates, item]); break;
    }
    try {
        await supabase.from((TABLES as any)[type]).insert({ id: item.id, data: item, user_id: currentBusinessId });
    } catch (err) { console.warn("Offline Mode: Resource added locally only."); }
  };

  const updateResource = async (type: string, id: string, updatedItem: any) => {
    switch(type) {
      case 'room': setRooms(rooms.map(r => r.id === id ? updatedItem : r)); break;
      case 'boat': setBoats(boats.map(b => b.id === id ? updatedItem : b)); break;
      case 'guide': setGuides(guides.map(g => g.id === id ? updatedItem : g)); break;
      case 'product': setProducts(products.map(p => p.id === id ? updatedItem : p)); break;
      case 'budget_template': setBudgetTemplates(budgetTemplates.map(b => b.id === id ? updatedItem : b)); break;
    }
    try {
        await supabase.from((TABLES as any)[type]).update({ data: updatedItem }).eq('id', id);
    } catch (err) { console.warn("Offline Mode: Resource updated locally only."); }
  };

  const deleteResource = async (type: string, id: string) => {
    switch(type) {
      case 'room': setRooms(rooms.filter(r => r.id !== id)); break;
      case 'boat': setBoats(boats.filter(b => b.id !== id)); break;
      case 'guide': setGuides(guides.filter(g => g.id !== id)); break;
      case 'product': setProducts(products.filter(p => p.id !== id)); break;
      case 'budget_template': setBudgetTemplates(budgetTemplates.filter(b => b.id !== id)); break;
    }
    try {
        await supabase.from((TABLES as any)[type]).delete().eq('id', id);
    } catch (err) { console.warn("Offline Mode: Resource deleted locally only."); }
  };

  const addDeal = async (deal: Deal) => {
    if (!currentBusinessId) return;
    setDeals([...deals, deal]);
    try {
        await supabase.from('deals').insert({ id: deal.id, data: deal, user_id: currentBusinessId });
    } catch (err) { console.warn("Offline Mode: Deal added locally only."); }
  };

  const updateDeal = async (deal: Deal) => {
    setDeals(deals.map(d => d.id === deal.id ? deal : d));
    try {
        await supabase.from('deals').update({ data: deal }).eq('id', deal.id);
    } catch (err) { console.warn("Offline Mode: Deal updated locally only."); }
  };

  const updateDealStage = async (id: string, stage: Deal['stage']) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;
    const updatedDeal = { ...deal, stage };
    updateDeal(updatedDeal);
  };

  const addReservation = async (res: Reservation) => {
    if (!currentBusinessId) return;
    setReservations([...reservations, res]);
    try {
        await supabase.from('reservations').insert({ id: res.id, data: res, user_id: currentBusinessId });
    } catch (err) { console.warn("Offline Mode: Reservation added locally only."); }
  };

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    const res = reservations.find(r => r.id === id);
    if (!res) return;
    const updatedRes = { ...res, status };
    setReservations(reservations.map(r => r.id === id ? updatedRes : r));
    try {
        await supabase.from('reservations').update({ data: updatedRes }).eq('id', id);
    } catch (err) { console.warn("Offline Mode: Reservation updated locally only."); }
  };

  const handleConsumption = async (reservationId: string, roomId: string, productId: string, quantityDelta: number) => {
    let updatedRes: Reservation | null = null;

    setReservations(prev => {
        const newReservations = prev.map(res => {
          if (res.id !== reservationId) return res;

          const updatedRooms = res.allocatedRooms.map(room => {
            if (room.roomId !== roomId) return room;

            const existingItemIndex = room.consumption.findIndex(c => c.productId === productId);
            
            if (existingItemIndex >= 0) {
               const existingItem = room.consumption[existingItemIndex];
               const newQuantity = existingItem.quantity + quantityDelta;
               
               if (newQuantity <= 0) {
                  const newConsumption = room.consumption.filter(c => c.productId !== productId);
                  return { ...room, consumption: newConsumption };
               } else {
                  const updatedItem = {
                      ...existingItem, 
                      quantity: newQuantity,
                      total: newQuantity * existingItem.unitPrice
                  };
                  const newConsumption = [...room.consumption];
                  newConsumption[existingItemIndex] = updatedItem;
                  return { ...room, consumption: newConsumption };
               }
            } else {
               if (quantityDelta <= 0) return room;
               const product = products.find(p => p.id === productId);
               if (!product) return room;

               const newItem: ConsumptionItem = {
                   id: Math.random().toString(36).substr(2, 9),
                   productId: product.id,
                   productName: product.name,
                   quantity: quantityDelta,
                   unitPrice: product.price,
                   total: product.price * quantityDelta,
                   timestamp: new Date().toISOString()
               };
               
               return { ...room, consumption: [...room.consumption, newItem] };
            }
          });
          const newRes = { ...res, allocatedRooms: updatedRooms };
          updatedRes = newRes;
          return newRes;
        });
        return newReservations;
    });

    if (updatedRes) {
        try {
            await supabase.from('reservations').update({ data: updatedRes }).eq('id', reservationId);
        } catch (err) { console.warn("Offline Mode: Consumption updated locally only."); }
    }
  };

  useEffect(() => {
    const activeRes = reservations.filter(r => r.status === 'checked-in');
    const occupiedRoomIds = new Set(activeRes.flatMap(r => r.allocatedRooms.map(ar => ar.roomId)));
    const occupiedBoatIds = new Set(activeRes.flatMap(r => r.boatIds));
    const busyGuideIds = new Set(activeRes.flatMap(r => r.guideIds));

    setRooms(prev => prev.map(r => ({ ...r, status: occupiedRoomIds.has(r.id) ? 'occupied' : (r.status === 'maintenance' ? 'maintenance' : 'available') })));
    setBoats(prev => prev.map(b => ({ ...b, status: occupiedBoatIds.has(b.id) ? 'occupied' : (b.status === 'maintenance' ? 'maintenance' : 'available') })));
    setGuides(prev => prev.map(g => ({ ...g, status: busyGuideIds.has(g.id) ? 'busy' : 'available' })));

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
      currentBusinessId
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
