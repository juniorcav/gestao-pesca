
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LodgeConfig, Room, Boat, Guide, Product, Deal, Reservation, ConsumptionItem, BudgetItemTemplate, Business, PlatformSettings, Plan, User
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
  updateReservation: (res: Reservation) => void;
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

  // Platform & Plans
  platformSettings: PlatformSettings;
  updatePlatformSettings: (settings: PlatformSettings) => void;
  plans: Plan[];
  addPlan: (plan: Plan) => void;
  updatePlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;

  // Team Management
  teamMembers: User[];
  addTeamMember: (member: Partial<User>) => Promise<{success: boolean, message?: string, inviteLink?: string}>;
  removeTeamMember: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to generate shades from hex
const generatePalette = (hex: string) => {
    const adjustBrightness = (col: string, amt: number) => {
        let usePound = false;
        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }
        let num = parseInt(col,16);
        let r = (num >> 16) + amt;
        if (r > 255) r = 255;
        else if  (r < 0) r = 0;
        let b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255;
        else if  (b < 0) b = 0;
        let g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255;
        else if (g < 0) g = 0;
        return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
    }

    return {
        50: adjustBrightness(hex, 150),
        100: adjustBrightness(hex, 130),
        200: adjustBrightness(hex, 100),
        300: adjustBrightness(hex, 70),
        400: adjustBrightness(hex, 40),
        500: hex, // Base
        600: adjustBrightness(hex, -20),
        700: adjustBrightness(hex, -50),
        800: adjustBrightness(hex, -80),
        900: adjustBrightness(hex, -110),
        950: adjustBrightness(hex, -130),
    };
};

const DEFAULT_PLATFORM: PlatformSettings = {
    id: 1,
    appName: 'PescaGestor Pro',
    primaryColor: '#16a34a'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  
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
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  
  // Super Admin / Platform State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Apply Theme Function
  const applyPlatformTheme = (colorHex: string) => {
      const palette = generatePalette(colorHex);
      const root = document.documentElement;
      Object.entries(palette).forEach(([key, value]) => {
          root.style.setProperty(`--color-nature-${key}`, value);
      });
  };

  // --- DATA FETCHING (SUPABASE) ---
  useEffect(() => {
    const fetchGlobalSettings = async () => {
        // Fetch Platform Settings (Public Read)
        const { data: settings } = await supabase.from('platform_settings').select('*').single();
        if (settings) {
            setPlatformSettings(settings);
            if (settings.primary_color) {
                applyPlatformTheme(settings.primary_color);
            }
        } else {
            applyPlatformTheme(DEFAULT_PLATFORM.primaryColor);
        }

        // Fetch Plans (Public Read)
        const { data: fetchedPlans } = await supabase.from('plans').select('*');
        if (fetchedPlans) {
            const mappedPlans = fetchedPlans.map((p:any) => ({
                ...p,
                features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features
            }));
            setPlans(mappedPlans);
        }
    };

    fetchGlobalSettings();

    if (!user) {
        setLoadingData(false);
        return;
    }

    const fetchUserData = async () => {
        setLoadingData(true);
        try {
            if (currentBusinessId) {
                const { data: businessData } = await supabase
                    .from('businesses')
                    .select('config')
                    .eq('id', currentBusinessId)
                    .single();
                
                if (businessData && businessData.config) {
                    setConfig(businessData.config);
                }

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

                // Fetch Team Members (Profiles linked to this business)
                const { data: team } = await supabase.from('profiles').select('*').eq('business_id', currentBusinessId);
                if (team) {
                    const mappedTeam: User[] = team.map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        email: t.email,
                        role: t.role,
                        businessId: t.business_id
                    }));
                    setTeamMembers(mappedTeam);
                }
            }

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

    fetchUserData();
  }, [user, currentBusinessId]);


  // --- CRUD ACTIONS (SUPABASE) ---

  const updateConfig = async (newConfig: LodgeConfig) => {
      if (!currentBusinessId) return;
      setConfig(newConfig);
      await supabase.from('businesses').update({ config: newConfig }).eq('id', currentBusinessId);
  };

  const addResource = async (type: string, item: any) => {
    if (!currentBusinessId) return;
    switch(type) {
      case 'room': setRooms(prev => [...prev, item]); break;
      case 'boat': setBoats(prev => [...prev, item]); break;
      case 'guide': setGuides(prev => [...prev, item]); break;
      case 'product': setProducts(prev => [...prev, item]); break;
      case 'budget_template': setBudgetTemplates(prev => [...prev, item]); break;
    }

    const tableName = type === 'budget_template' ? 'budget_templates' : type + 's'; 
    await supabase.from(tableName).insert({
        id: item.id,
        business_id: currentBusinessId,
        data: item
    });
  };

  const updateResource = async (type: string, id: string, updatedItem: any) => {
    if (!currentBusinessId) return;
    switch(type) {
      case 'room': setRooms(prev => prev.map(r => r.id === id ? updatedItem : r)); break;
      case 'boat': setBoats(prev => prev.map(b => b.id === id ? updatedItem : b)); break;
      case 'guide': setGuides(prev => prev.map(g => g.id === id ? updatedItem : g)); break;
      case 'product': setProducts(prev => prev.map(p => p.id === id ? updatedItem : p)); break;
      case 'budget_template': setBudgetTemplates(prev => prev.map(b => b.id === id ? updatedItem : b)); break;
    }

    const tableName = type === 'budget_template' ? 'budget_templates' : type + 's';
    await supabase.from(tableName).update({ data: updatedItem }).eq('id', id).eq('business_id', currentBusinessId);
  };

  const deleteResource = async (type: string, id: string) => {
    if (!currentBusinessId) return;
    switch(type) {
      case 'room': setRooms(prev => prev.filter(r => r.id !== id)); break;
      case 'boat': setBoats(prev => prev.filter(b => b.id !== id)); break;
      case 'guide': setGuides(prev => prev.filter(g => g.id !== id)); break;
      case 'product': setProducts(prev => prev.filter(p => p.id !== id)); break;
      case 'budget_template': setBudgetTemplates(prev => prev.filter(b => b.id !== id)); break;
    }

    const tableName = type === 'budget_template' ? 'budget_templates' : type + 's';
    await supabase.from(tableName).delete().eq('id', id).eq('business_id', currentBusinessId);
  };

  // --- TEAM MANAGEMENT ---
  const addTeamMember = async (member: Partial<User>) => {
      if (!currentBusinessId) return { success: false, message: "Erro de negócio." };
      
      // 1. Check Limit
      if (teamMembers.length >= 6) { 
          return { success: false, message: "Limite de usuários excedido." };
      }

      // Generate Invite Link logic (without DB write)
      // The actual User creation happens when they sign up via the link
      const baseUrl = window.location.origin + window.location.pathname;
      const inviteUrl = `${baseUrl}#/login?invite=true&email=${encodeURIComponent(member.email || '')}&name=${encodeURIComponent(member.name || '')}&bid=${currentBusinessId}&bname=${encodeURIComponent(config.name)}`;

      return { 
          success: true, 
          message: "Link gerado com sucesso.",
          inviteLink: inviteUrl 
      };
  };

  const removeTeamMember = async (id: string) => {
      if (!currentBusinessId) return;
      if (id === user?.id) {
          alert("Você não pode remover a si mesmo.");
          return;
      }
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      await supabase.from('profiles').delete().eq('id', id);
  };


  // --- CRM & RESERVATIONS ---
  const addDeal = async (deal: Deal) => {
      if (!currentBusinessId) return;
      setDeals(prev => [...prev, deal]);
      await supabase.from('deals').insert({ 
          id: deal.id, business_id: currentBusinessId, 
          contact_name: deal.contactName, value: deal.value, stage: deal.stage, data: deal 
      });
  };
  
  const updateDeal = async (deal: Deal) => {
      if (!currentBusinessId) return;
      setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
      await supabase.from('deals').update({ 
          contact_name: deal.contactName, value: deal.value, stage: deal.stage, data: deal 
      }).eq('id', deal.id).eq('business_id', currentBusinessId);
  };

  const updateDealStage = async (id: string, stage: Deal['stage']) => {
    if (!currentBusinessId) return;
    let updatedDeal: Deal | undefined;
    setDeals(prev => prev.map(d => { if (d.id === id) { updatedDeal = { ...d, stage }; return updatedDeal; } return d; }));
    if (updatedDeal) await supabase.from('deals').update({ stage: stage, data: updatedDeal }).eq('id', id).eq('business_id', currentBusinessId);
  };

  const addReservation = async (res: Reservation) => {
      if (!currentBusinessId) return;
      setReservations(prev => [...prev, res]);
      await supabase.from('reservations').insert({ id: res.id, business_id: currentBusinessId, data: res });
  };

  const updateReservation = async (res: Reservation) => {
      if (!currentBusinessId) return;
      setReservations(prev => prev.map(r => r.id === res.id ? res : r));
      await supabase.from('reservations').update({ data: res }).eq('id', res.id).eq('business_id', currentBusinessId);
  };

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
      if (!currentBusinessId) return;
      let updatedRes: Reservation | undefined;
      setReservations(prev => prev.map(r => { if (r.id === id) { updatedRes = { ...r, status }; return updatedRes; } return r; }));
      if (updatedRes) await supabase.from('reservations').update({ data: updatedRes }).eq('id', id).eq('business_id', currentBusinessId);
  };

  const handleConsumption = async (reservationId: string, roomId: string, productId: string, quantityDelta: number) => {
    if (!currentBusinessId) return;
    let updatedRes: Reservation | undefined;
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
            if (newQuantity <= 0) room.consumption.splice(existingItemIndex, 1);
            else room.consumption[existingItemIndex] = { ...existingItem, quantity: newQuantity, total: newQuantity * existingItem.unitPrice };
        } else {
            if (quantityDelta <= 0) return prev;
            const product = products.find(p => p.id === productId);
            if (product) {
                const newItem: ConsumptionItem = { id: Math.random().toString(36).substr(2, 9), productId: product.id, productName: product.name, quantity: quantityDelta, unitPrice: product.price, total: product.price * quantityDelta, timestamp: new Date().toISOString() };
                room.consumption.push(newItem);
            }
        }
        res.allocatedRooms[roomIndex] = room;
        newReservations[resIndex] = res;
        updatedRes = res;
        return newReservations;
    });
    if (updatedRes) await supabase.from('reservations').update({ data: updatedRes }).eq('id', reservationId).eq('business_id', currentBusinessId);
  };

  // --- BUSINESS MANAGEMENT ---
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

  // --- PLATFORM & PLANS ---
  const updatePlatformSettings = async (settings: PlatformSettings) => {
      setPlatformSettings(settings);
      applyPlatformTheme(settings.primaryColor);
      await supabase.from('platform_settings').upsert({
          id: 1,
          app_name: settings.appName,
          logo_url: settings.logoUrl,
          primary_color: settings.primaryColor
      });
  };

  const addPlan = async (plan: Plan) => {
      setPlans(prev => [...prev, plan]);
      await supabase.from('plans').insert({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          features: JSON.stringify(plan.features),
          active: plan.active
      });
  };

  const updatePlan = async (plan: Plan) => {
      setPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
      await supabase.from('plans').update({
          name: plan.name,
          price: plan.price,
          features: JSON.stringify(plan.features),
          active: plan.active
      }).eq('id', plan.id);
  };

  const deletePlan = async (id: string) => {
      setPlans(prev => prev.filter(p => p.id !== id));
      await supabase.from('plans').delete().eq('id', id);
  };

  return (
    <AppContext.Provider value={{
      config, updateConfig,
      rooms, boats, guides, products, budgetTemplates,
      addResource, updateResource, deleteResource,
      deals, updateDealStage, addDeal, updateDeal,
      reservations, addReservation, updateReservation, updateReservationStatus, handleConsumption,
      loadingData,
      theme, toggleTheme,
      currentBusinessId,
      businesses, addBusiness, updateBusiness, deleteBusiness,
      platformSettings, updatePlatformSettings, plans, addPlan, updatePlan, deletePlan,
      teamMembers, addTeamMember, removeTeamMember
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
