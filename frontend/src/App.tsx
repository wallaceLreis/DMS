import { useRoutes } from 'react-router-dom';
import { routerConfig } from './router';

function App() {
  const element = useRoutes(routerConfig);
  return element;
}

export default App;