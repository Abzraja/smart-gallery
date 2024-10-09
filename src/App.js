import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2'; // Correct Grid2 import
import Button from '@mui/material/Button';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import UploadPhoto from './UploadPhoto';
import PhotoGallery from './PhotoGallery';

const App = ({ signOut, user }) => {
  const [view, setView] = useState('gallery');
  const [photos, setPhotos] = useState([]);

  const handleUploadSuccess = () => {
    // Trigger a refresh in the PhotoGallery after a successful upload
    if (photoGalleryRef.current) {
      photoGalleryRef.current.fetchPhotos();
    }
  };

  const photoGalleryRef = React.useRef();

  return (
    <Box sx={{ m: '10px', p: '0px' }}>
      {/* Header with Sign Out */}
      <Button variant="contained" onClick={signOut} style={{ float: 'right' }}>
        Sign out
      </Button>

      {/* Greeting */}
      <Typography variant="h1" sx={{ fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' }, mb: 5 }}>
        Hello, {user.signInDetails.loginId}
      </Typography>

      {/* Conditional rendering based on 'view' */}
      {view === 'gallery' && (
        <Grid container spacing={2} direction="column">
          {/* Upload Photo section */}
          <Grid xs={12} sm={12}>
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 1 }}>
              <Typography variant="h6" gutterBottom>
                Upload New Photo
              </Typography>
              <UploadPhoto onUploadSuccess={handleUploadSuccess} />
            </Box>
          </Grid>

          {/* Gallery section */}
          <Grid xs={12} sm={12}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Gallery
              </Typography>
              <PhotoGallery ref={photoGalleryRef} />
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default withAuthenticator(App);
