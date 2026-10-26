// FixFlow - Main Dashboard Layout Shell
// Shared persistent layout containing Sidebar, TopNavbar, and lazy route outlet.

import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopNavbar from "./TopNavbar.jsx";
import ToastContainer from "../feedback/ToastContainer.jsx";
import ErrorBoundary from "../feedback/ErrorBoundary.jsx";
import { SkeletonDetail } from "../feedback/LoadingSkeleton.jsx";

export function MainLayout() {
  return (
    <div className="app-container">
      {/* Persistent Desktop Sidebar / Responsive Drawer */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <TopNavbar />

        <main className="page-content">
          <ErrorBoundary>
            <Suspense fallback={<SkeletonDetail />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default MainLayout;
