import { LodgeConfig, Room, Boat, Guide, Product, Deal, Reservation, BudgetItemTemplate } from './types';

export const INITIAL_CONFIG: LodgeConfig = {
  name: "Nome do Negócio",
  description: "",
  phone: "",
  email: "",
  address: "",
  
  nearestAirport: "",
  airportDistance: "",
  mainRiver: "",
  mainFishes: "",
  
  galleryImages: [],
  pdfImages: [],
  promotionalVideo: "",

  services: [],

  policy: ""
};

export const COLOR_PALETTES = [
  { name: 'Natureza (Padrão)', hex: '#16a34a' }, // green-600
  { name: 'Oceano Profundo', hex: '#0284c7' },   // sky-600
  { name: 'Pôr do Sol', hex: '#ea580c' },        // orange-600
  { name: 'Ametista Real', hex: '#7c3aed' },     // violet-600
  { name: 'Frutas Vermelhas', hex: '#dc2626' },  // red-600
  { name: 'Safira Escura', hex: '#1e3a8a' },     // blue-900
  { name: 'Turquesa Tropical', hex: '#0d9488' }, // teal-600
  { name: 'Grafite Moderno', hex: '#4b5563' },   // gray-600
];

export const MOCK_BUDGET_TEMPLATES: BudgetItemTemplate[] = [];

export const MOCK_ROOMS: Room[] = [];

export const MOCK_BOATS: Boat[] = [];

export const MOCK_GUIDES: Guide[] = [];

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_DEALS: Deal[] = [];

export const MOCK_RESERVATIONS: Reservation[] = [];