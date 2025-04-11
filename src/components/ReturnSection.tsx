
import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
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
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [borrowerName, setBorrowerName] = useState<string | null>(null);
  
  const handleSearchBook = async () => {
    if (!bookCode.trim()) {
      toast.error("Please enter a book code");
      return;
    }
    
    setIsSearchingBook(true);
    setBorrowerName(null);
    
    try {
      const foundBook = await getBookByCode(bookCode);
      
      if (foundBook) {
        setBook(foundBook);
        setIsBookFound(true);
        
        if (!foundBook.isBorrowed) {
          toast.error("This book is not currently borrowed");
        } else if (foundBook.borrowedBy) {
          // Get borrower name
          try {
            const student = await getStudentByCode(foundBook.borrowedBy);
            setBorrowerName(student?.name || foundBook.borrowedBy);
          } catch (error) {
            console.error("Error fetching borrower name:", error);
            setBorrowerName(foundBook.borrowedBy);
          }
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
  
  const handleReturn = async () => {
    try {
      if (!book) {
        toast.error("Please select a book");
        return;
      }
      
      if (!book.isBorrowed) {
        toast.error("This book is not currently borrowed");
        return;
      }
      
      setIsReturning(true);
      
      await returnBook(book.code);
      
      // Reset form
      setBookCode('');
      setBook(null);
      setIsBookFound(null);
      setBorrowerName(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error returning book");
      }
    } finally {
      setIsReturning(false);
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
            {book.isBorrowed && borrowerName && (
              <p><strong>Borrowed By:</strong> {borrowerName}</p>
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
            disabled={!book || !book.isBorrowed || isReturning}
          >
            {isReturning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Return Book"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReturnSection;
