'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FaceAttendanceModal from './FaceAttendanceModal';
import GreetingPopupModal from './GreetingPopupModal';
import { useAuth } from '@/lib/AuthContext';

interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onRefreshData?: () => void;
}

export default function DashboardLayout({
  title,
  subtitle,
  children,
  onRefreshData
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  const handleFaceSuccess = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="app-main">
        <Navbar
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenFaceModal={() => setFaceModalOpen(true)}
        />

        <div className="page-content">
          {children}
        </div>
      </div>

      <FaceAttendanceModal
        isOpen={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onSuccess={handleFaceSuccess}
      />

      <GreetingPopupModal />
    </div>
  );
}
