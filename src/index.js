import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import { Helmet } from 'react-helmet';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


Amplify.configure(awsconfig);

const container = document.getElementById('root'); // Get the root element
const root = createRoot(container); // Create a root

root.render(
  <React.StrictMode>
    <Helmet>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <title>AI Labelling Image Gallery</title>
    </Helmet>
    <CssBaseline enableColorScheme />
    <App />
  </React.StrictMode>
);

reportWebVitals();
