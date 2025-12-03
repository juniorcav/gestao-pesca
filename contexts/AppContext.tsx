
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LodgeConfig, Room, Boat, Guide, Product, Deal, Reservation, ConsumptionItem, BudgetItemTemplate, Business 
} from '../types';
import { INITIAL_CONFIG } from '../constants';
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  
  // Identifying the tenant (business)
  // Now explicitly using the businessId from the user profile
  const currentBusinessId = user?.businessId || '';

  // --- THEME ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // --- STATE ---
  const [config, setConfig] = useState<LodgeConfig>(INITIAL_CONFIG);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [budgetTemplates, setBudgetTemplates] = useState<BudgetItemTemplate[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]); // Only for Super Admin

  // --- DATA FETCHING (SUPABASE) ---
  useEffect(() => {
    if (!user) {
        setLoadingData(false);
        return;
    }

    const fetchData = async () => {
        setLoadingData(true);
        try {
            // Only fetch if we have a business ID (or if we want to support admins seeing stuff)
            if (currentBusinessId) {
                // 1. Config (Fetched directly from businesses table 'config' column)
                const { data: businessData, error: configError } = await supabase
                    .from('businesses')
                    .select('config')
                    .eq('id', currentBusinessId)
                    .single();
                
                if (businessData && businessData.config) {
                    setConfig(businessData.config);
                } else if (configError) {
                    console.error("Error fetching config:", configError);
                }

                // Helper to unwrap Supabase response
                const unwrap = (rows: any[]) => rows.map((row: any) => ({ ...row.data, id: row.id }));

                const { data: r } = await supabase.from('rooms').select('*').eq('business_id', currentBusinessId);
                if (r) setRooms(unwrap(r));

                const { data: b } = await supabase.from('boats').select('*').eq('business_id', currentBusinessId);
                if (b) setBoats(unwrap(b));

                const { data: g } = await supabase.from('guides').select('*').eq('business_id', currentBusinessId);
                if (g) setGuides(unwrap(g));

                const { data: p } = await supabase.from('products').select('*').eq('business_id', currentBusinessId);
                if (p) setProducts(unwrap(p));

                const { data: t } = await supabase.from('budget_templates').select('*').eq('business_id', currentBusinessId);
                if (t) setBudgetTemplates(unwrap(t));

                const { data: d } = await supabase.from('deals').select('*').eq('business_id', currentBusinessId);
                if (d) setDeals(unwrap(d));

                const { data: res } = await supabase.from('reservations').select('*').eq('business_id', currentBusinessId);
                if (res) setReservations(unwrap(res));
            }

            // Super Admin Data
            if (user.role === 'platform_admin') {
                const { data: biz } = await supabase.from('businesses').select('*');
                if (biz) setBusinesses(biz as any);
            }

        } catch (error) {
            console.error("Error loading data from Supabase:", error);
        } finally {
            setLoadingData(false);
        }
    };

    fetchData();
  }, [user, currentBusinessId]);


  // --- CRUD ACTIONS (SUPABASE) ---

  const updateConfig = async (newConfig: LodgeConfig) => {
      if (!currentBusinessId) return;
      setConfig(newConfig);
      // Update config column in businesses table
      const { error } = await supabase.from('businesses').update({ config: newConfig }).eq('id', currentBusinessId);
      if (error) console.error("Error saving config:", error);
  };

  const addResource = async (type: string, item: any) => {
    if (!currentBusinessId) return;
    // Optimistic Update
    switch(type) {
      case 'room': setRooms(prev => [...prev, item]); break;
      case 'boat': setBoats(prev => [...prev, item]); break;
      case 'guide': setGuides(prev => [...prev, item]); break;
      case 'product': setProducts(prev => [...prev, item]); break;
      case 'budget_template': setBudgetTemplates(prev => [...prev, item]); break;
    }

    // Save to DB
    const tableName = type === 'budget_template' ? 'budget_templates' : type + 's'; // pluralize
    const { error } = await supabase.from(tableName).insert({
        id: item.id,
        business_id: currentBusinessId,
        data: item
    });
    if (error) console.error(`Error adding ${type}:`, error);
  };

  const updateResource = async (type: string, id: string, updatedItem: any) => {
    if (!currentBusinessId) return;
    // Optimistic
    switch(type) {
      case 'room': setRooms(prev => prev.map(r => r.id === id ? updatedItem : r)); break;
      case 'boat': setBoats(prev => prev.map(b => b.id === id ? updatedItem : b)); break;
      case 'guide': setGuides(prev => prev.map(g => g.id === id ? updatedItem : g)); break;
      case 'product': setProducts(prev => prev.map(p => p.id === id ? updatedItem : p)); break;
      case 'budget_template': setBudgetTemplates(prev => prev.map(b => b.id === id ? updatedItem : b)); break;
    }

    // Save to DB
    const tableName = type === 'budget_template' ? 'budget_templates' : type + 's';
    const { error } = await supabase.from(tableName).update({ data: updatedItem }).eq('id', id).eq('business_id', currentBusinessId);
    if (error) console.error(`Error updating ${type}:`, error);
  };

  const deleteResource = async (type: string, id: string) => {
    if (!currentBusinessId) return;
    // Optimistic
    switch(type) {
      case 'room': setRooms(prev => prev.filter(r => r.id !== id)); break;
      case 'boat': setBoats(prev => prev.filter(b => b.id !== id)); break;
      case 'guide': setGuides(prev => prev.filter(g => g.id !== id)); break;
      case 'product': setProducts(prev => prev.filter(p => p.id !== id)); break;
      case 'budget_template': setBudgetTemplates(prev => prev.filter(b => b.id !== id)); break;
    }

    // Save to DB
    const tableName = type === 'budget_template' ? 'budget_templates' : type + 's';
    const { error } = await supabase.from(tableName).delete().eq('id', id).eq('business_id', currentBusinessId);
    if (error) console.error(`Error deleting ${type}:`, error);
  };

  // --- CRM ACTIONS ---

  const addDeal = async (deal: Deal) => {
      if (!currentBusinessId) return;
      setDeals(prev => [...prev, deal]);
      // Inserting with explicit columns for better DB management
      const { error } = await supabase.from('deals').insert({ 
          id: deal.id, 
          business_id: currentBusinessId, 
          contact_name: deal.contactName,
          value: deal.value,
          stage: deal.stage,
          data: deal 
      });
      if (error) console.error("Error adding deal:", error);
  };
  
  const updateDeal = async (deal: Deal) => {
      if (!currentBusinessId) return;
      setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
      // Updating with explicit columns
      const { error } = await supabase.from('deals').update({ 
          contact_name: deal.contactName,
          value: deal.value,
          stage: deal.stage,
          data: deal 
      }).eq('id', deal.id).eq('business_id', currentBusinessId);
      if (error) console.error("Error updating deal:", error);
  };

  const updateDealStage = async (id: string, stage: Deal['stage']) => {
    if (!currentBusinessId) return;
    let updatedDeal: Deal | undefined;
    setDeals(prev => {
        return prev.map(d => {
            if (d.id === id) {
                updatedDeal = { ...d, stage };
                return updatedDeal;
            }
            return d;
        });
    });

    if (updatedDeal) {
        // Update stage column and data json
        const { error } = await supabase.from('deals').update({ 
            stage: stage,
            data: updatedDeal 
        }).eq('id', id).eq('business_id', currentBusinessId);
        if (error) console.error("Error updating deal stage:", error);
    }
  };

  // --- RESERVATION ACTIONS ---

  const addReservation = async (res: Reservation) => {
      if (!currentBusinessId) return;
      setReservations(prev => [...prev, res]);
      const { error } = await supabase.from('reservations').insert({ id: res.id, business_id: currentBusinessId, data: res });
      if (error) console.error("Error adding reservation:", error);
  };

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
      if (!currentBusinessId) return;
      let updatedRes: Reservation | undefined;
      setReservations(prev => {
          return prev.map(r => {
              if (r.id === id) {
                  updatedRes = { ...r, status };
                  return updatedRes;
              }
              return r;
          });
      });

      if (updatedRes) {
          const { error } = await supabase.from('reservations').update({ data: updatedRes }).eq('id', id).eq('business_id', currentBusinessId);
          if (error) console.error("Error updating reservation status:", error);
      }
  };

  const handleConsumption = async (reservationId: string, roomId: string, productId: string, quantityDelta: number) => {
    if (!currentBusinessId) return;
    let updatedRes: Reservation | undefined;
    
    setReservations(prev => {
        const newReservations = [...prev];
        const resIndex = newReservations.findIndex(r => r.id === reservationId);
        if (resIndex === -1) return prev;

        const res = { ...newReservations[resIndex] };
        res.allocatedRooms = [...res.allocatedRooms]; // shallow copy
        
        const roomIndex = res.allocatedRooms.findIndex(r => r.roomId === roomId);
        if (roomIndex === -1) return prev;

        const room = { ...res.allocatedRooms[roomIndex] };
        room.consumption = [...room.consumption]; // shallow copy

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
        updatedRes = res;
        return newReservations;
    });

    // Save to DB
    if (updatedRes) {
        const { error } = await supabase.from('reservations').update({ data: updatedRes }).eq('id', reservationId).eq('business_id', currentBusinessId);
        if (error) console.error("Error saving consumption:", error);
    }
  };

  // --- BUSINESS MANAGEMENT (SUPER ADMIN) ---
  const addBusiness = async (business: Business) => {
      setBusinesses(prev => [...prev, business]);
      await supabase.from('businesses').insert(business);
  };
  const updateBusiness = async (business: Business) => {
      setBusinesses(prev => prev.map(b => b.id === business.id ? business : b));
      await supabase.from('businesses').update(business).eq('id', business.id);
  };
  const deleteBusiness = async (id: string) => {
      setBusinesses(prev => prev.filter(b => b.id !== id));
      await supabase.from('businesses').delete().eq('id', id);
  };

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
