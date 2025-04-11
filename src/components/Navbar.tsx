
import React, { useState } from 'react';
import { Book, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToExcel, importFromExcel } from '@/data/libraryData';
import { toast } from 'sonner';

type NavbarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState("");

  const handleExport = () => {
    const data = exportToExcel();
    setExportData(data);
    setIsExportDialogOpen(true);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importFromExcel(content);
        toast.success("Data imported successfully");
      } catch (error) {
        toast.error("Error importing data");
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = "";
  };

  return (
    <div className="bg-library-primary text-white shadow-md">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Book className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">Library Management System</h1>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={activeTab === 'students' ? "secondary" : "ghost"}
              className="text-white hover:text-white"
              onClick={() => setActiveTab('students')}
            >
              <Users className="h-5 w-5 mr-2" />
              Students
            </Button>
            
            <Button
              variant={activeTab === 'books' ? "secondary" : "ghost"}
              className="text-white hover:text-white"
              onClick={() => setActiveTab('books')}
            >
              <Book className="h-5 w-5 mr-2" />
              Books
            </Button>
            
            <Button
              variant={activeTab === 'borrow' ? "secondary" : "ghost"}
              className="text-white hover:text-white"
              onClick={() => setActiveTab('borrow')}
            >
              Borrow
            </Button>
            
            <Button
              variant={activeTab === 'return' ? "secondary" : "ghost"}
              className="text-white hover:text-white"
              onClick={() => setActiveTab('return')}
            >
              Return
            </Button>
            
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button variant="outline" className="text-white border-white hover:bg-white/20" onClick={handleExport}>
                Export Data
              </Button>
              <Button variant="outline" className="text-white border-white hover:bg-white/20" onClick={() => document.getElementById('import-file')?.click()}>
                Import Data
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleImport}
              />
            </div>
          </div>
        </div>
      </div>
      
      {isExportDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Export Data</h2>
            <p className="text-gray-600 mb-4">
              In a real application, this would download an Excel file. For this demo, you can copy the text below:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-gray-800 max-h-96">
              {exportData}
            </pre>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setIsExportDialogOpen(false)}
                className="mr-2"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(exportData);
                  toast.success("Data copied to clipboard");
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
