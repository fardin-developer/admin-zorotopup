import { createBrowserRouter, useLocation } from 'react-router-dom';
import {
  AccountDeactivePage,
  EcommerceDashboardPage,
  ErrorPage,
  PasswordResetPage,
  SignInPage,
  SignUpPage,
  SitemapPage,
  UserProfileActionsPage,
  UserProfileActivityPage,
  UserProfileDetailsPage,
  UserProfileFeedbackPage,
  UserProfileHelpPage,
  UserProfileInformationPage,
  UserProfilePreferencesPage,
  UserProfileSecurityPage,
  VerifyEmailPage,
  WelcomePage,
  GamePage,
  GamePackagesPage,
  EditPackagePage,
  CreatePackagesPage,
  EditGamePage,
  UsersPage,
  OrdersPage,
  TransactionsPage,
  WalletActionsPage,
  NewsManagementPage,
  SearchResultsPage,
  GamingAccountsPage,
} from '../pages';
import { DashboardLayout, UserAccountLayout } from '../layouts';
import React, { ReactNode, useEffect } from 'react';
import { AboutPage } from '../pages/About.tsx';
import CreateGame from '../pages/CreateGame.tsx';
import { ProtectedRoute } from '../components';
import ManageGateway from '../pages/ManageGateway.tsx';

// Custom scroll restoration function
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    }); // Scroll to the top when the location changes
  }, [pathname]);

  return null; // This component doesn't render anything
};

type PageProps = {
  children: ReactNode;
};

// Create an HOC to wrap your route components with ScrollToTop
const PageWrapper = ({ children }: PageProps) => {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
};

// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <EcommerceDashboardPage />,
      },
    ],
  },
  {
    path: '/games',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'game',
        element: <GamePage />,
      },
      {
        path: 'game/edit/:id',
        element: <EditGamePage />,
      },
      {
        path: 'game/:gameId/packages',
        element: <GamePackagesPage />,
      },
      {
        path: 'game/:gameId/packages/:packageId/edit',
        element: <EditPackagePage />,
      },
      {
        path: 'create-packages',
        element: <CreatePackagesPage />,
      },
      {
        path: 'create-game',
        element: <CreateGame />,
      },
    ],
  },
  {
    path: '/gaming-accounts',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <GamingAccountsPage />,
      },
    ],
  },
  {
    path: '/user',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <UsersPage />,
      },
    ],
  },
  {
    path: '/orders',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <OrdersPage />,
      },
    ],
  },
  {
    path: '/transactions',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <TransactionsPage />,
      },
    ],
  },
  {
    path: '/wallet-actions',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <WalletActionsPage />,
      },
    ],
  },
  {
    path: '/news-management',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <NewsManagementPage />,
      },
    ],
  },
  {
    path: '/search',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <SearchResultsPage />,
      },
    ],
  },
  {
    path: '/gateway',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <ManageGateway />,
      },
    ],
  },
  {
    path: '/profile',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <UserAccountLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <UserProfileDetailsPage />,
      },
      {
        path: 'details',
        element: <UserProfileDetailsPage />,
      },
      {
        path: 'preferences',
        element: <UserProfilePreferencesPage />,
      },
      {
        path: 'information',
        element: <UserProfileInformationPage />,
      },
      {
        path: 'security',
        element: <UserProfileSecurityPage />,
      },
      {
        path: 'activity',
        element: <UserProfileActivityPage />,
      },
      {
        path: 'actions',
        element: <UserProfileActionsPage />,
      },
      {
        path: 'help',
        element: <UserProfileHelpPage />,
      },
      {
        path: 'feedback',
        element: <UserProfileFeedbackPage />,
      },
    ],
  },
  {
    path: '/about',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <AboutPage />,
      },
    ],
  },
  {
    path: '/sitemap',
    element: (
      <PageWrapper
        children={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <SitemapPage />,
      },
    ],
  },
  // Keep auth routes for login functionality
  {
    path: '/auth',
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'signup',
        element: <SignUpPage />,
      },
      {
        path: 'signin',
        element: <SignInPage />,
      },
      {
        path: 'welcome',
        element: <WelcomePage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'password-reset',
        element: <PasswordResetPage />,
      },
      {
        path: 'account-delete',
        element: <AccountDeactivePage />,
      },
    ],
  },
  // Commented out unused routes
  /*
  {
    path: '/dashboards',
    element: <PageWrapper children={<DashboardLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'default',
        element: <DefaultDashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsDashboardPage />,
      },
      {
        path: 'ecommerce',
        element: <EcommerceDashboardPage />,
      },
      {
        path: 'marketing',
        element: <MarketingDashboardPage />,
      },
      {
        path: 'social',
        element: <SocialDashboardPage />,
      },
      {
        path: 'bidding',
        element: <BiddingDashboardPage />,
      },
      {
        path: 'learning',
        element: <LearningDashboardPage />,
      },
      {
        path: 'logistics',
        element: <LogisticsDashboardPage />,
      },
    ],
  },
  {
    path: '/corporate',
    element: <PageWrapper children={<CorporateLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'about',
        element: <CorporateAboutPage />,
      },
      {
        path: 'team',
        element: <CorporateTeamPage />,
      },
      {
        path: 'faqs',
        element: <CorporateFaqPage />,
      },
      {
        path: 'contact',
        element: <CorporateContactPage />,
      },
      {
        path: 'pricing',
        element: <CorporatePricingPage />,
      },
      {
        path: 'license',
        element: <CorporateLicensePage />,
      },
    ],
  },
  {
    path: '/user-profile',
    element: <PageWrapper children={<UserAccountLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'details',
        element: <UserProfileDetailsPage />,
      },
      {
        path: 'preferences',
        element: <UserProfilePreferencesPage />,
      },
      {
        path: 'information',
        element: <UserProfileInformationPage />,
      },
      {
        path: 'security',
        element: <UserProfileSecurityPage />,
      },
      {
        path: 'activity',
        element: <UserProfileActivityPage />,
      },
      {
        path: 'actions',
        element: <UserProfileActionsPage />,
      },
      {
        path: 'help',
        element: <UserProfileHelpPage />,
      },
      {
        path: 'feedback',
        element: <UserProfileFeedbackPage />,
      },
    ],
  },
  {
    path: 'errors',
    errorElement: <ErrorPage />,
    children: [
      {
        path: '400',
        element: <Error400Page />,
      },
      {
        path: '403',
        element: <Error403Page />,
      },
      {
        path: '404',
        element: <Error404Page />,
      },
      {
        path: '500',
        element: <Error500Page />,
      },
      {
        path: '503',
        element: <Error503Page />,
      },
    ],
  },
  */
]);

export default router;
