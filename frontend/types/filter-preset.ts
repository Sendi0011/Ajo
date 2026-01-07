export interface FilterPreset {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    filters: FilterOptions;
    isDefault: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface FilterPresetInput {
    name: string;
    description?: string;
    filters: FilterOptions;
    isDefault?: boolean;
  }