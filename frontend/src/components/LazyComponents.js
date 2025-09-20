import { lazy } from 'react';

// Lazy load page components for code splitting
export const AboutPage = lazy(() => import('./pages/AboutPage'));
export const AdminPage = lazy(() => import('./pages/AdminPage'));
export const BillingPage = lazy(() => import('./pages/BillingPage'));
export const ChatPage = lazy(() => import('./pages/ChatPage'));
export const DashboardPage = lazy(() => import('./pages/DashboardPage'));
export const LandingPage = lazy(() => import('./pages/LandingPage'));
export const LoginPage = lazy(() => import('./pages/LoginPage'));
export const NumbersPage = lazy(() => import('./pages/NumbersPage'));
export const RegisterPage = lazy(() => import('./pages/RegisterPage'));
export const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
export const VerificationsPage = lazy(() => import('./pages/VerificationsPage'));

// Lazy load heavy molecules
export const DataTable = lazy(() => import('./molecules/DataTable'));
export const RichTextEditor = lazy(() => import('./molecules/RichTextEditor'));
export const TwoFactorSetup = lazy(() => import('./molecules/TwoFactorSetup'));