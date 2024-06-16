import './App.css'
import { Auth0Provider } from "@auth0/auth0-react"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from './routes/root';
import Details from './routes/details';
import AddRecipe from './routes/add';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/details/:recipeId",
    element: <Details />,
  },
  {
    path: "/add",
    element: <AddRecipe />
  }
]);

function App() {
  return (
    <Auth0Provider
      domain="<your-auth0-domain-url-here>"
      clientId="<you-auth0-client-id-here>"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <RouterProvider router={router} />
    </Auth0Provider>
  )

}

export default App
