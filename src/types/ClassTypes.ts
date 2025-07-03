import { Block } from '../components/BlockEditor';

export interface PlannedClass {
  id: string;
  title: string;
  date: string; // formato ISO
  tags: string[];
  totalDuration: number;
  blocks: Block[];
  objective: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  notionPageId?: string; // ID de la página en Notion (si se ha sincronizado)
}

export interface ClassFilter {
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  searchTerm?: string;
}