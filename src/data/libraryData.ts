
import { Book, Student } from "../types";
import { toast } from "sonner";

// Mock library data with some initial values
let students: Student[] = [
  { id: "1", name: "John Smith", grade: "10", code: "S001" },
  { id: "2", name: "Sarah Johnson", grade: "11", code: "S002" },
  { id: "3", name: "Michael Brown", grade: "9", code: "S003" },
  { id: "4", name: "Emily Wilson", grade: "12", code: "S004" },
  { id: "5", name: "David Lee", grade: "10", code: "S005" }
];

let books: Book[] = [
  { id: "1", name: "To Kill a Mockingbird", author: "Harper Lee", code: "B001", isBorrowed: false, borrowedBy: null },
  { id: "2", name: "1984", author: "George Orwell", code: "B002", isBorrowed: true, borrowedBy: "S001" },
  { id: "3", name: "The Great Gatsby", author: "F. Scott Fitzgerald", code: "B003", isBorrowed: false, borrowedBy: null },
  { id: "4", name: "Pride and Prejudice", author: "Jane Austen", code: "B004", isBorrowed: true, borrowedBy: "S003" },
  { id: "5", name: "The Catcher in the Rye", author: "J.D. Salinger", code: "B005", isBorrowed: false, borrowedBy: null }
];

// Student functions
export const getAllStudents = (): Student[] => {
  return [...students];
};

export const addStudent = (student: Omit<Student, "id">): Student => {
  // Check if student code already exists
  if (students.some(s => s.code.toLowerCase() === student.code.toLowerCase())) {
    throw new Error("Student code already exists");
  }
  
  const newStudent = {
    ...student,
    id: (students.length + 1).toString()
  };
  
  students = [...students, newStudent];
  toast.success("Student added successfully");
  return newStudent;
};

export const searchStudents = (query: string): Student[] => {
  const lowercaseQuery = query.toLowerCase();
  return students.filter(
    student => 
      student.name.toLowerCase().includes(lowercaseQuery) || 
      student.code.toLowerCase().includes(lowercaseQuery)
  );
};

export const getStudentByCode = (code: string): Student | undefined => {
  return students.find(
    student => student.code.toLowerCase() === code.toLowerCase()
  );
};

export const getStudentBorrowedBooks = (studentCode: string): Book[] => {
  return books.filter(
    book => book.borrowedBy?.toLowerCase() === studentCode.toLowerCase()
  );
};

// Book functions
export const getAllBooks = (): Book[] => {
  return [...books];
};

export const addBook = (book: Omit<Book, "id" | "isBorrowed" | "borrowedBy">): Book => {
  // Check if book code already exists
  if (books.some(b => b.code.toLowerCase() === book.code.toLowerCase())) {
    throw new Error("Book code already exists");
  }
  
  const newBook = {
    ...book,
    id: (books.length + 1).toString(),
    isBorrowed: false,
    borrowedBy: null
  };
  
  books = [...books, newBook];
  toast.success("Book added successfully");
  return newBook;
};

export const searchBooks = (query: string): Book[] => {
  const lowercaseQuery = query.toLowerCase();
  return books.filter(
    book => 
      book.name.toLowerCase().includes(lowercaseQuery) || 
      book.code.toLowerCase().includes(lowercaseQuery) ||
      book.author.toLowerCase().includes(lowercaseQuery)
  );
};

export const getBookByCode = (code: string): Book | undefined => {
  return books.find(
    book => book.code.toLowerCase() === code.toLowerCase()
  );
};

// Borrow/Return functions
export const borrowBook = (bookCode: string, studentCode: string): void => {
  const bookIndex = books.findIndex(
    book => book.code.toLowerCase() === bookCode.toLowerCase()
  );
  
  if (bookIndex === -1) {
    throw new Error("Book not found");
  }
  
  const book = books[bookIndex];
  
  if (book.isBorrowed) {
    throw new Error("Book is already borrowed");
  }
  
  const student = getStudentByCode(studentCode);
  
  if (!student) {
    throw new Error("Student not found");
  }
  
  books = [
    ...books.slice(0, bookIndex),
    { ...book, isBorrowed: true, borrowedBy: student.code },
    ...books.slice(bookIndex + 1)
  ];
  
  toast.success(`Book "${book.name}" borrowed by ${student.name}`);
};

export const returnBook = (bookCode: string): void => {
  const bookIndex = books.findIndex(
    book => book.code.toLowerCase() === bookCode.toLowerCase()
  );
  
  if (bookIndex === -1) {
    throw new Error("Book not found");
  }
  
  const book = books[bookIndex];
  
  if (!book.isBorrowed) {
    throw new Error("Book is not currently borrowed");
  }
  
  books = [
    ...books.slice(0, bookIndex),
    { ...book, isBorrowed: false, borrowedBy: null },
    ...books.slice(bookIndex + 1)
  ];
  
  toast.success(`Book "${book.name}" has been returned`);
};

// Export data as string (mocking Excel download)
export const exportToExcel = (): string => {
  // This is a simplified mock of what would be Excel export functionality
  // In a real app, this would use a library to create an actual Excel file
  
  const studentCSV = "Student Name,Grade,Student Code\n" + 
    students.map(s => `${s.name},${s.grade},${s.code}`).join("\n");
  
  const bookCSV = "Book Name,Author,Book Code,Is Borrowed,Borrowed By\n" + 
    books.map(b => 
      `${b.name},${b.author},${b.code},${b.isBorrowed ? "Yes" : "No"},${b.borrowedBy || ""}`
    ).join("\n");
  
  return `STUDENTS\n${studentCSV}\n\nBOOKS\n${bookCSV}`;
};

// Import data from string (mocking Excel upload)
export const importFromExcel = (data: string): void => {
  // This is a simplified mock of what would be Excel import functionality
  // In a real app, this would parse an actual Excel file
  
  const sections = data.split("\n\n");
  const studentsSection = sections[0];
  const booksSection = sections[1];
  
  if (studentsSection && studentsSection.startsWith("STUDENTS")) {
    const lines = studentsSection.split("\n").slice(2); // Skip header
    const newStudents: Student[] = lines.map((line, index) => {
      const [name, grade, code] = line.split(",");
      return { id: (index + 1).toString(), name, grade, code };
    });
    
    if (newStudents.length > 0) {
      students = newStudents;
    }
  }
  
  if (booksSection && booksSection.startsWith("BOOKS")) {
    const lines = booksSection.split("\n").slice(2); // Skip header
    const newBooks: Book[] = lines.map((line, index) => {
      const [name, author, code, isBorrowed, borrowedBy] = line.split(",");
      return {
        id: (index + 1).toString(),
        name,
        author,
        code,
        isBorrowed: isBorrowed === "Yes",
        borrowedBy: borrowedBy || null
      };
    });
    
    if (newBooks.length > 0) {
      books = newBooks;
    }
  }
  
  toast.success("Data imported successfully");
};
