export type ViewType = 'landing' | 'tool';
export type Type = 'Sketch' | 'Idea' | null;
export type DifficultyLevel = 'Basic' | 'Intermediate' | 'Advanced' | null;

export interface ConfiguratorState {
  step: 1 | 2 | 3 | 4 | 5;
  Type: Type;
  topic: string;
  material: string;
  color: string;
  assembly: string;
  capabilities: string[];
  difficulty: DifficultyLevel;
  partCount: {
    min: string;
    max: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  quantity: number | '';
  budget: number | '';
  deliveryDate: string;
  uploadedFiles: File[];
  aiPrompt: string;
  isGenerating: boolean;
  requirementId?: string;
}

export const INITIAL_CONFIG: ConfiguratorState = {
  step: 1,
  Type: null,
  topic: '',
  material: '',
  color: '',
  assembly: '',
  capabilities: [],
  difficulty: null,
  partCount: { min: '', max: '' },
  dimensions: { length: 0, width: 0, height: 0 },
  quantity: '',
  budget: '',
  deliveryDate: '',
  uploadedFiles: [],
  aiPrompt: '',
  isGenerating: false,
  requirementId: '',
};

export const DIFFICULTY_LEVELS = [
  { id: 'Basic', desc: 'Simple monolithic shapes' },
  { id: 'Intermediate', desc: 'Basic multi-part assemblies' },
  { id: 'Advanced', desc: 'Complex moving mechanisms' },
];
