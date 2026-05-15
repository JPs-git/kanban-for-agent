import type { RouteObject } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import NotFound from '../pages/NotFound';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;