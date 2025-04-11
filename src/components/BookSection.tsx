
import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { addBook, getAllBooks, searchBooks, getStudentByCode } from '@/data/libraryData';
import { Book } from '@/types';
import { toast } from 'sonner';

const BookSection: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newBook, setNewBook] = useState({ name: '', author: '', code: '' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [borrowerNames, setBorrowerNames] = useState<Record<string, string>>({});
  
  useEffect(() => {
    loadBooks();
  }, []);
  
  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await getAllBooks();
      setBooks(data);
      
      // Load borrower names for all borrowed books
      const borrowerCodes = data
        .filter(book => book.isBorrowed && book.borrowedBy)
        .map(book => book.borrowedBy as string);
      
      const uniqueCodes = [...new Set(borrowerCodes)];
      const names: Record<string, string> = {};
      
      await Promise.all(
        uniqueCodes.map(async code => {
          try {
            const student = await getStudentByCode(code);
            if (student) {
              names[code] = student.name;
            } else {
              names[code] = code;
            }
          } catch (error) {
            console.error(`Error fetching student ${code}:`, error);
            names[code] = code;
          }
        })
      );
      
      setBorrowerNames(names);
    } catch (error) {
      console.error("Error loading books:", error);
      toast.error("Failed to load books");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      if (searchQuery.trim() === '') {
        await loadBooks();
      } else {
        const results = await searchBooks(searchQuery);
        setBooks(results);
      }
    } catch (error) {
      console.error("Error searching books:", error);
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddBook = async () => {
    try {
      if (!newBook.name || !newBook.author || !newBook.code) {
        toast.error("All fields are required");
        return;
      }
      
      await addBook(newBook);
      setNewBook({ name: '', author: '', code: '' });
      setIsAddDialogOpen(false);
      await loadBooks();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error adding book");
      }
    }
  };
  
  const getBorrowerName = (studentCode: string) => {
    return borrowerNames[studentCode] || studentCode;
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
        <h2 className="library-heading mb-4 md:mb-0">Book Management</h2>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="flex w-full md:w-auto">
            <Input
              placeholder="Search by name, author or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="rounded-r-none"
            />
            <Button
              onClick={handleSearch}
              className="rounded-l-none"
              disabled={isLoading}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" onClick={loadBooks} disabled={isLoading} className="ml-2">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">
                    Title:
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Book title"
                    value={newBook.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="author" className="text-right">
                    Author:
                  </label>
                  <Input
                    id="author"
                    name="author"
                    placeholder="Book author"
                    value={newBook.author}
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
                    placeholder="Book code"
                    value={newBook.code}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBook}>
                  Add Book
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading books...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="library-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Borrowed By</th>
                </tr>
              </thead>
              <tbody>
                {books.length > 0 ? (
                  books.map(book => (
                    <tr key={book.id}>
                      <td>{book.name}</td>
                      <td>{book.author}</td>
                      <td>{book.code}</td>
                      <td>
                        {book.isBorrowed ? (
                          <Badge variant="destructive">Borrowed</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Available
                          </Badge>
                        )}
                      </td>
                      <td>
                        {book.isBorrowed && book.borrowedBy ? (
                          getBorrowerName(book.borrowedBy)
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No books found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookSection;
