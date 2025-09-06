export interface GamingAccountHighlights {
  collectorRank?: string;
  winrate?: number;
  skinsOwned?: number;
  highestRank?: string;
  loginInfo?: string;
  server?: string;
}

export interface GamingAccountSkin {
  hero?: string;
  skinName?: string;
  rarity?: string;
}

export interface GamingAccount {
  _id: string;
  game: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  highlights?: GamingAccountHighlights;
  skins?: GamingAccountSkin[];
  images?: string[];
  tags?: string[];
  sellerId: string;
  buyerId?: string;
  status: 'active' | 'sold' | 'inactive';
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GamingAccountWithSeller extends Omit<GamingAccount, 'sellerId' | 'buyerId'> {
  sellerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  buyerId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface CreateGamingAccountPayload {
  game: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  highlights?: GamingAccountHighlights;
  skins?: GamingAccountSkin[];
  images?: string[];
  tags?: string[];
}

export interface UpdateGamingAccountPayload extends Partial<CreateGamingAccountPayload> {}

export interface GamingAccountFilters {
  page?: number;
  limit?: number;
  game?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GamingAccountApiResponse {
  success: boolean;
  gamingId?: GamingAccountWithSeller;
  gamingIds?: GamingAccountWithSeller[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
  error?: string;
}
