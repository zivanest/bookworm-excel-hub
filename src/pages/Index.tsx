
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import StudentSection from '@/components/StudentSection';
import BookSection from '@/components/BookSection';
import BorrowSection from '@/components/BorrowSection';
import ReturnSection from '@/components/ReturnSection';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="min-h-screen bg-library-background">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
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
