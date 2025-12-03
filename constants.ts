

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
  promotionalVideo: "",

  services: [],

  policy: ""
};

export const MOCK_BUDGET_TEMPLATES: BudgetItemTemplate[] = [];

export const MOCK_ROOMS: Room[] = [];

export const MOCK_BOATS: Boat[] = [];

export const MOCK_GUIDES: Guide[] = [];

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_DEALS: Deal[] = [];

export const MOCK_RESERVATIONS: Reservation[] = [];
