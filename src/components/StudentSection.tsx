
import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { addStudent, getAllStudents, searchStudents, getStudentBorrowedBooks } from '@/data/libraryData';
import { Student, Book } from '@/types';
import { toast } from 'sonner';

const StudentSection: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', grade: '', code: '' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBorrowedBooksDialogOpen, setIsBorrowedBooksDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  
  useEffect(() => {
    loadStudents();
  }, []);
  
  const loadStudents = () => {
    setStudents(getAllStudents());
  };
  
  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      loadStudents();
    } else {
      setStudents(searchStudents(searchQuery));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddStudent = () => {
    try {
      if (!newStudent.name || !newStudent.grade || !newStudent.code) {
        toast.error("All fields are required");
        return;
      }
      
      addStudent(newStudent);
      setNewStudent({ name: '', grade: '', code: '' });
      setIsAddDialogOpen(false);
      loadStudents();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error adding student");
      }
    }
  };
  
  const handleViewBorrowedBooks = (student: Student) => {
    setSelectedStudent(student);
    const books = getStudentBorrowedBooks(student.code);
    setBorrowedBooks(books);
    setIsBorrowedBooksDialogOpen(true);
  };
  
  // Handle Enter key press in search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="library-heading mb-4 md:mb-0">Student Management</h2>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="flex w-full md:w-auto">
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="rounded-r-none"
            />
            <Button
              onClick={handleSearch}
              className="rounded-l-none"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">
                    Name:
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Student name"
                    value={newStudent.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="grade" className="text-right">
                    Grade:
                  </label>
                  <Input
                    id="grade"
                    name="grade"
                    placeholder="Student grade"
                    value={newStudent.grade}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="code" className="text-right">
                    Code:
                  </label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="Student code"
                    value={newStudent.code}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStudent}>
                  Add Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="library-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>Student Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.grade}</td>
                    <td>{student.code}</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBorrowedBooks(student)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Borrowed Books
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Dialog open={isBorrowedBooksDialogOpen} onOpenChange={setIsBorrowedBooksDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Books Borrowed by {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="library-table">
              <thead>
                <tr>
                  <th>Book Name</th>
                  <th>Author</th>
                  <th>Book Code</th>
                </tr>
              </thead>
              <tbody>
                {borrowedBooks.length > 0 ? (
                  borrowedBooks.map(book => (
                    <tr key={book.id}>
                      <td>{book.name}</td>
                      <td>{book.author}</td>
                      <td>{book.code}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">
                      No books currently borrowed
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentSection;
