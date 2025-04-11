
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StudentSection from '@/components/StudentSection';
import BookSection from '@/components/BookSection';
import BorrowSection from '@/components/BorrowSection';
import ReturnSection from '@/components/ReturnSection';
import GitHubSettings from '@/components/GitHubSettings';
import { initializeData } from '@/data/libraryData';
import { githubService } from '@/services/githubService';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on component mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      // Try to load the GitHub config first
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Give time for the GitHub service to load config from file
        await initializeData();
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-library-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-library-primary mx-auto"></div>
          <p className="mt-4 text-lg text-library-primary">Loading library system...</p>
        </div>
      </div>
    );
  }

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
