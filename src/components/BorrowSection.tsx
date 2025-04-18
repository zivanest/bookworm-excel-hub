
import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { borrowBook, getBookByCode, getStudentByCode } from '@/data/libraryData';
import { Book, Student } from '@/types';
import { toast } from 'sonner';

const BorrowSection: React.FC = () => {
  const [bookCode, setBookCode] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [book, setBook] = useState<Book | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isBookFound, setIsBookFound] = useState<boolean | null>(null);
  const [isStudentFound, setIsStudentFound] = useState<boolean | null>(null);
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  
  const handleSearchBook = async () => {
    if (!bookCode.trim()) {
      toast.error("Please enter a book code");
      return;
    }
    
    setIsSearchingBook(true);
    
    try {
      const foundBook = await getBookByCode(bookCode);
      
      if (foundBook) {
        setBook(foundBook);
        setIsBookFound(true);
        
        if (foundBook.isBorrowed) {
          toast.error("This book is already borrowed");
        }
      } else {
        setBook(null);
        setIsBookFound(false);
        toast.error("Book not found");
      }
    } catch (error) {
      console.error("Error searching for book:", error);
      toast.error("Error searching for book");
      setIsBookFound(false);
    } finally {
      setIsSearchingBook(false);
    }
  };
  
  const handleSearchStudent = async () => {
    if (!studentCode.trim()) {
      toast.error("Please enter a student code");
      return;
    }
    
    setIsSearchingStudent(true);
    
    try {
      const foundStudent = await getStudentByCode(studentCode);
      
      if (foundStudent) {
        setStudent(foundStudent);
        setIsStudentFound(true);
      } else {
        setStudent(null);
        setIsStudentFound(false);
        toast.error("Student not found");
      }
    } catch (error) {
      console.error("Error searching for student:", error);
      toast.error("Error searching for student");
      setIsStudentFound(false);
    } finally {
      setIsSearchingStudent(false);
    }
  };
  
  const handleBorrow = async () => {
    if (!book || !student) {
      toast.error("Please select both a book and a student");
      return;
    }
    
    if (book.isBorrowed) {
      toast.error("This book is already borrowed");
      return;
    }
    
    setIsBorrowing(true);
    
    try {
      await borrowBook(book.code, student.code);
      
      // Reset form
      setBookCode('');
      setStudentCode('');
      setBook(null);
      setStudent(null);
      setIsBookFound(null);
      setIsStudentFound(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error borrowing book");
      }
    } finally {
      setIsBorrowing(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h2 className="library-heading">Borrow Book</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="library-subheading">Book Information</h3>
          
          <div className="flex mb-4">
            <Input
              placeholder="Enter book code or name"
              value={bookCode}
              onChange={(e) => setBookCode(e.target.value)}
              className="rounded-r-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSearchBook()}
            />
            <Button
              onClick={handleSearchBook}
              className="rounded-l-none"
              disabled={isSearchingBook}
            >
              {isSearchingBook ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {isBookFound === true && book && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p><strong>Title:</strong> {book.name}</p>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Code:</strong> {book.code}</p>
              <p>
                <strong>Status:</strong>{' '}
                {book.isBorrowed ? (
                  <span className="text-red-500">Borrowed</span>
                ) : (
                  <span className="text-green-600">Available</span>
                )}
              </p>
            </div>
          )}
          
          {isBookFound === false && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              Book not found. Please check the code and try again.
            </div>
          )}
        </Card>
        
        <Card className="p-6">
          <h3 className="library-subheading">Student Information</h3>
          
          <div className="flex mb-4">
            <Input
              placeholder="Enter student code or name"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              className="rounded-r-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()}
            />
            <Button
              onClick={handleSearchStudent}
              className="rounded-l-none"
              disabled={isSearchingStudent}
            >
              {isSearchingStudent ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {isStudentFound === true && student && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Grade:</strong> {student.grade}</p>
              <p><strong>Code:</strong> {student.code}</p>
            </div>
          )}
          
          {isStudentFound === false && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              Student not found. Please check the code and try again.
            </div>
          )}
        </Card>
      </div>
      
      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={handleBorrow}
          disabled={!book || !student || book.isBorrowed || isBorrowing}
        >
          {isBorrowing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Borrow Book"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BorrowSection;
