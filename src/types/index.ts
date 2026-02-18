export interface Folder {
  id?: number;
  clientName: string;
  constructionSite: string;
  description: string;
  projectRef: string;
  phone: string;
  thirdParty: string;
  projectDate: string;
  notes: string;
  projectCode?: string;
  status: 'Da Iniziare' | 'In Corso' | 'Finita' | 'Sospese';
  createdAt: string | Date;
}

export interface FileAttachment {
  id?: number;
  folderId: number;
  name: string;
  path: string;
  type: string;
  size: number;
  category: string;
  createdAt: string | Date;
}

export interface Category {
  id: number;
  name: string;
}
