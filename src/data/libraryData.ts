import { Book, Student, LibraryData } from "../types";
import { toast } from "sonner";
import { githubService } from "../services/githubService";

// Local cache for data
let localCache: LibraryData = {
  students: [
    { id: "1", name: "John Smith", grade: "10", code: "S001" },
    { id: "2", name: "Sarah Johnson", grade: "11", code: "S002" },
    { id: "3", name: "Michael Brown", grade: "9", code: "S003" },
    { id: "4", name: "Emily Wilson", grade: "12", code: "S004" },
    { id: "5", name: "David Lee", grade: "10", code: "S005" }
  ],
  books: [
    { id: "1", name: "To Kill a Mockingbird", author: "Harper Lee", code: "B001", isBorrowed: false, borrowedBy: null },
    { id: "2", name: "1984", author: "George Orwell", code: "B002", isBorrowed: true, borrowedBy: "S001" },
    { id: "3", name: "The Great Gatsby", author: "F. Scott Fitzgerald", code: "B003", isBorrowed: false, borrowedBy: null },
    { id: "4", name: "Pride and Prejudice", author: "Jane Austen", code: "B004", isBorrowed: true, borrowedBy: "S003" },
    { id: "5", name: "The Catcher in the Rye", author: "J.D. Salinger", code: "B005", isBorrowed: false, borrowedBy: null }
  ],
  lastUpdated: new Date().toISOString()
};

// Load data from GitHub
export const loadData = async (): Promise<void> => {
  try {
    const data = await githubService.getData();
    if (data) {
      localCache = data;
      console.log("Data loaded from GitHub:", data);
    }
  } catch (error) {
    console.error("Error loading data:", error);
    // Keep using local cache if GitHub fetch fails
  }
};

// Save data to GitHub
export const saveData = async (): Promise<void> => {
  try {
    await githubService.saveData(localCache);
  } catch (error) {
    console.error("Error saving data:", error);
    toast.error("Failed to save data to GitHub");
  }
};

// Initialize data 
export const initializeData = async (): Promise<void> => {
  if (githubService.hasValidConfig()) {
    await loadData();
  } else {
    console.log("GitHub not configured, using local data");
  }
};

// Student functions
export const getAllStudents = async (): Promise<Student[]> => {
  await loadData();
  return [...localCache.students];
};

export const addStudent = async (student: Omit<Student, "id">): Promise<Student> => {
  // Check if student code already exists
  if (localCache.students.some(s => s.code.toLowerCase() === student.code.toLowerCase())) {
    throw new Error("Student code already exists");
  }
  
  const newStudent = {
    ...student,
    id: (localCache.students.length + 1).toString()
  };
  
  localCache.students = [...localCache.students, newStudent];
  await saveData();
  toast.success("Student added successfully");
  return newStudent;
};

export const searchStudents = async (query: string): Promise<Student[]> => {
  await loadData();
  const lowercaseQuery = query.toLowerCase();
  return localCache.students.filter(
    student => 
      student.name.toLowerCase().includes(lowercaseQuery) || 
      student.code.toLowerCase().includes(lowercaseQuery)
  );
};

export const getStudentByCode = async (code: string): Promise<Student | undefined> => {
  await loadData();
  return localCache.students.find(
    student => student.code.toLowerCase() === code.toLowerCase()
  );
};

export const getStudentBorrowedBooks = async (studentCode: string): Promise<Book[]> => {
  await loadData();
  return localCache.books.filter(
    book => book.borrowedBy?.toLowerCase() === studentCode.toLowerCase()
  );
};

// Book functions
export const getAllBooks = async (): Promise<Book[]> => {
  await loadData();
  return [...localCache.books];
};

export const addBook = async (book: Omit<Book, "id" | "isBorrowed" | "borrowedBy">): Promise<Book> => {
  // Check if book code already exists
  if (localCache.books.some(b => b.code.toLowerCase() === book.code.toLowerCase())) {
    throw new Error("Book code already exists");
  }
  
  const newBook = {
    ...book,
    id: (localCache.books.length + 1).toString(),
    isBorrowed: false,
    borrowedBy: null
  };
  
  localCache.books = [...localCache.books, newBook];
  await saveData();
  toast.success("Book added successfully");
  return newBook;
};

export const searchBooks = async (query: string): Promise<Book[]> => {
  await loadData();
  const lowercaseQuery = query.toLowerCase();
  return localCache.books.filter(
    book => 
      book.name.toLowerCase().includes(lowercaseQuery) || 
      book.code.toLowerCase().includes(lowercaseQuery) ||
      book.author.toLowerCase().includes(lowercaseQuery)
  );
};

export const getBookByCode = async (code: string): Promise<Book | undefined> => {
  await loadData();
  return localCache.books.find(
    book => book.code.toLowerCase() === code.toLowerCase()
  );
};

// Borrow/Return functions
export const borrowBook = async (bookCode: string, studentCode: string): Promise<void> => {
  await loadData();
  const bookIndex = localCache.books.findIndex(
    book => book.code.toLowerCase() === bookCode.toLowerCase()
  );
  
  if (bookIndex === -1) {
    throw new Error("Book not found");
  }
  
  const book = localCache.books[bookIndex];
  
  if (book.isBorrowed) {
    throw new Error("Book is already borrowed");
  }
  
  const student = await getStudentByCode(studentCode);
  
  if (!student) {
    throw new Error("Student not found");
  }
  
  localCache.books = [
    ...localCache.books.slice(0, bookIndex),
    { ...book, isBorrowed: true, borrowedBy: student.code },
    ...localCache.books.slice(bookIndex + 1)
  ];
  
  await saveData();
  toast.success(`Book "${book.name}" borrowed by ${student.name}`);
};

export const returnBook = async (bookCode: string): Promise<void> => {
  await loadData();
  const bookIndex = localCache.books.findIndex(
    book => book.code.toLowerCase() === bookCode.toLowerCase()
  );
  
  if (bookIndex === -1) {
    throw new Error("Book not found");
  }
  
  const book = localCache.books[bookIndex];
  
  if (!book.isBorrowed) {
    throw new Error("Book is not currently borrowed");
  }
  
  localCache.books = [
    ...localCache.books.slice(0, bookIndex),
    { ...book, isBorrowed: false, borrowedBy: null },
    ...localCache.books.slice(bookIndex + 1)
  ];
  
  await saveData();
  toast.success(`Book "${book.name}" has been returned`);
};

// Export data as string (mocking Excel download)
export const exportToExcel = async (): Promise<string> => {
  await loadData();
  
  const studentCSV = "Student Name,Grade,Student Code\n" + 
    localCache.students.map(s => `${s.name},${s.grade},${s.code}`).join("\n");
  
  const bookCSV = "Book Name,Author,Book Code,Is Borrowed,Borrowed By\n" + 
    localCache.books.map(b => 
      `${b.name},${b.author},${b.code},${b.isBorrowed ? "Yes" : "No"},${b.borrowedBy || ""}`
    ).join("\n");
  
  return `STUDENTS\n${studentCSV}\n\nBOOKS\n${bookCSV}`;
};

// Import data from string (mocking Excel upload)
export const importFromExcel = async (data: string): Promise<void> => {
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
      localCache.students = newStudents;
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
      localCache.books = newBooks;
    }
  }
  
  await saveData();
  toast.success("Data imported successfully");
};
