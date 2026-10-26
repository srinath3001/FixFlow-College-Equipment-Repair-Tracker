// FixFlow - Application Router Configuration
// Implements nested layout routing, code-splitting with React.lazy, and fallbacks.

import React, { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";

// Code splitting: Lazy-loaded page components for optimal bundle performance
const DashboardPage = lazy(() => import("../pages/DashboardPage.jsx"));
const ReportComplaintPage = lazy(() => import("../pages/ReportComplaintPage.jsx"));
const ComplaintsListPage = lazy(() => import("../pages/ComplaintsListPage.jsx"));
const ComplaintDetailPage = lazy(() => import("../pages/ComplaintDetailPage.jsx"));
const TechniciansPage = lazy(() => import("../pages/TechniciansPage.jsx"));
const EquipmentPage = lazy(() => import("../pages/EquipmentPage.jsx"));
const SettingsPage = lazy(() => import("../pages/SettingsPage.jsx"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "complaints",
        element: <ComplaintsListPage />,
      },
      {
        path: "complaints/new",
        element: <ReportComplaintPage />,
      },
      {
        path: "complaints/:id",
        element: <ComplaintDetailPage />,
      },
      {
        path: "technicians",
        element: <TechniciansPage />,
      },
      {
        path: "equipment",
        element: <EquipmentPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "*",
        element: (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: 12 }}>404 — Page Not Found</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
              The requested view does not exist in the FixFlow application.
            </p>
            <Navigate to="/dashboard" replace />
          </div>
        ),
      },
    ],
  },
]);

export default router;
