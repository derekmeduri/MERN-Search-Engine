import ReactDOM from 'react-dom/client';
// Import the required Provider component and createBrowserRouter helper function
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import the pages the application should be able to display
import App from './App.jsx';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';

// Define the router object which will control the Provider's ability to display certain pages to match the proper URLs
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <h1 className='display-2'>Wrong page!</h1>,
    children: [
      {
        index: true,
        element: <SearchBooks />,
      },
      {
        path: '/saved',
        element: <SavedBooks />,
      },
    ],
  },
]);

// Render the Provider which will keep track of the application's location
ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);