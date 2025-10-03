import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { TabsProvider } from './contexts/TabsContext';

function App() {
  return (
    <TabsProvider>
      <RouterProvider router={router} />
    </TabsProvider>
  );
}

export default App;