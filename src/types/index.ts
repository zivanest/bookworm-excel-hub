
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
