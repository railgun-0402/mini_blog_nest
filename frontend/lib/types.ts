export type Company = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  organizationId: string;
  companyId: string;
  name: string;
  email: string | null;
  position: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NoteAuthor = {
  id: string;
  email: string;
};

export type Note = {
  id: string;
  organizationId: string;
  companyId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  user: NoteAuthor;
};

export type Tag = {
  id: string;
  name: string;
};

export type CompanyTag = {
  companyId: string;
  tagId: string;
  tag: Tag;
};

export type CompanyDetail = Company & {
  contacts: Contact[];
  notes: Note[];
  companyTags: CompanyTag[];
};

export type PaginatedResult<T> = {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateCompanyInput = {
  name: string;
  description?: string;
  websiteUrl?: string;
};

export type CreateContactInput = {
  name: string;
  email?: string;
  position?: string;
};

export type CreateNoteInput = {
  body: string;
};

export type CreateTagInput = {
  name: string;
};
