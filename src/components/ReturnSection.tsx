
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { returnBook, getBookByCode, getStudentByCode } from '@/data/libraryData';
import { Book } from '@/types';
import { toast } from 'sonner';

const ReturnSection: React.FC = () => {
  const [bookCode, setBookCode] = useState('');
  const [book, setBook] = useState<Book | null>(null);
  const [isBookFound, setIsBookFound] = useState<boolean | null>(null);
  
  const handleSearchBook = () => {
    if (!bookCode.trim()) {
      toast.error("Please enter a book code");
      return;
    }
    
    const foundBook = getBookByCode(bookCode);
    
    if (foundBook) {
      setBook(foundBook);
      setIsBookFound(true);
      
      if (!foundBook.isBorrowed) {
        toast.error("This book is not currently borrowed");
      }
    } else {
      setBook(null);
      setIsBookFound(false);
      toast.error("Book not found");
    }
  };
  
  const getBorrowerName = () => {
    if (!book || !book.borrowedBy) return null;
    
    const student = getStudentByCode(book.borrowedBy);
    return student ? student.name : book.borrowedBy;
  };
  
  const handleReturn = () => {
    try {
      if (!book) {
        toast.error("Please select a book");
        return;
      }
      
      if (!book.isBorrowed) {
        toast.error("This book is not currently borrowed");
        return;
      }
      
      returnBook(book.code);
      
      // Reset form
      setBookCode('');
      setBook(null);
      setIsBookFound(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error returning book");
      }
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h2 className="library-heading">Return Book</h2>
      
      <Card className="p-6 max-w-xl mx-auto">
        <h3 className="library-subheading">Book Information</h3>
        
        <div className="flex mb-4">
          <Input
            placeholder="Enter book code or name"
            value={bookCode}
            onChange={(e) => setBookCode(e.target.value)}
            className="rounded-r-none"
          />
          <Button
            onClick={handleSearchBook}
            className="rounded-l-none"
          >
            <Search className="h-4 w-4" />
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
            {book.isBorrowed && (
              <p><strong>Borrowed By:</strong> {getBorrowerName()}</p>
            )}
          </div>
        )}
        
        {isBookFound === false && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            Book not found. Please check the code and try again.
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Button
            size="lg"
            onClick={handleReturn}
            disabled={!book || !book.isBorrowed}
          >
            Return Book
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReturnSection;
