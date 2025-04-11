
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StudentSection from '@/components/StudentSection';
import BookSection from '@/components/BookSection';
import BorrowSection from '@/components/BorrowSection';
import ReturnSection from '@/components/ReturnSection';
import GitHubSettings from '@/components/GitHubSettings';
import { initializeData } from '@/data/libraryData';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    const init = async () => {
      await initializeData();
      setIsInitialized(true);
    };
    
    init();
  }, []);

  return (
    <div className="min-h-screen bg-library-background">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-4 py-2 flex justify-end">
        <GitHubSettings />
      </div>
      
      <div className="py-6">
        {activeTab === 'students' && <StudentSection />}
        {activeTab === 'books' && <BookSection />}
        {activeTab === 'borrow' && <BorrowSection />}
        {activeTab === 'return' && <ReturnSection />}
      </div>
    </div>
  );
};

export default Index;
