
export interface Student {
  id: string;
  name: string;
  grade: string;
  code: string;
}

export interface Book {
  id: string;
  name: string;
  author: string;
  code: string;
  isBorrowed: boolean;
  borrowedBy: string | null;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  path: string;
  token: string;
  branch?: string;
}

export interface LibraryData {
  students: Student[];
  books: Book[];
  lastUpdated: string;
}
