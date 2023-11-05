import { RouteObject } from 'react-router-dom';
import {
  Apps,
  Billings,
  CreateProduct,
  Dashboard,
  ErrorPage,
  Login,
  OrderDetails,
  Orders,
  Payments,
  Products,
  Settings,
  Users,
  ProductDetails,
  Subscriptions,
  FAQs,
  TermsOfUses,
  PolicyAndPrivacy,
  Contact,
  ForgotPassword,
  ResetPassword,
  Plans,
  CreatePlan,
  UpdatePlan,
  Pricing,
  ServerSettings
} from 'src/screens';
import OrderDetailss from 'src/screens/orders/orderDetails';

type Route = RouteObject & {
  permission?: string[];
};

const globalRoutes: Route[] = [
  {
    path: '*',
    element: <ErrorPage />
  },
  {
    path: '/pages/faqs',
    element: <FAQs />
  },
  {
    path: '/pages/terms',
    element: <TermsOfUses />
  },
  {
    path: '/pages/policy-and-privacy',
    element: <PolicyAndPrivacy />
  },
  {
    path: '/contact',
    element: <Contact />
  }
];

const authenticationRoutes: RouteObject[] = [
  {
    path: '/pricing',
    element: <Pricing />
  },
  {
    path: '/account/login',
    element: <Login />
  },
  {
    path: '/account/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/account/reset-password',
    element: <ResetPassword />
  },

  ...globalRoutes
];

const routes: Route[] = [
  {
    path: '/',
    element: <Dashboard />,
    permission: ['dashboard']
  },
  // {
  //   path: '/apps',
  //   element: <Apps />
  // },
  {
    path: '/orders',
    element: <Orders />,
    permission: ['orders']
  },
  {
    path: '/orders/:id',
    element: <OrderDetails />,
    permission: ['orders']
  },
  {
    path: '/products',
    element: <Products />,
    permission: ['products']
  },
  {
    path: '/products/:id',
    element: <ProductDetails />,
    permission: ['products']
  },
  {
    path: '/users',
    element: <Users />,
    permission: ['users']
  },
  {
    path: '/settings',
    element: <Settings />,
    permission: ['settings']
  },
  {
    path: '/subscriptions',
    element: <Subscriptions />,
    permission: ['subscriptions']
  },
  {
    path: '/plans',
    element: <Plans />,
    permission: ['plans']
  },
  {
    path: '/plans/create',
    element: <CreatePlan />,
    permission: ['plans']
  },
  {
    path: '/plans/:id',
    element: <UpdatePlan />,
    permission: ['plans']
  },
  {
    path: '/products/add',
    element: <CreateProduct />,
    permission: ['products']
  },
  {
    path: '/billings',
    element: <Billings />,
    permission: ['billings']
  },
  {
    path: '/billings/payments',
    element: <Payments />,
    permission: ['payments']
  },
  {
    path: '/website/keys',
    element: <ServerSettings />,
    permission: ['server']
  },

  ...globalRoutes
];

const names: any[] = [];

export { globalRoutes, authenticationRoutes, routes, names };
