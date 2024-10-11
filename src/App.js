import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import UploadPhoto from './UploadPhoto';
import PhotoGallery from './PhotoGallery';
import { list, getUrl } from '@aws-amplify/storage'; // Updated import
import { fetchAuthSession } from '@aws-amplify/auth';

const App = ({ signOut, user }) => {
  const [photos, setPhotos] = useState([]);
  const [view, setView] = useState('gallery'); // New state to manage which component to show

  const fetchUpdatedGallery = async () => {
    try {
      const { identityId } = await fetchAuthSession();
      const result = await list(`private/${identityId}/`, { level: 'private' });

      if (result && result.length > 0) {
        const photoUrls = await Promise.all(
          result
            .filter(photo => photo.size > 0)
            .map(async (photo) => {
              const signedUrl = await getUrl(photo.key, { level: 'private' });
              return { path: photo.key, url: signedUrl };
            })
        );

        setPhotos(photoUrls);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  const handleUploadSuccess = (newPhoto) => {
    setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
  };

  return (
    <Box sx={{ m:3, p: '0px' }}>
      <Button variant="contained" onClick={signOut} style={{ float: 'right' }}>
        Sign out
      </Button>

      {/* Buttons to toggle between gallery and upload photo */}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setView('gallery')} sx={{ mr: 1, mb:1 }}>
          View Gallery
        </Button>
        <Button variant="contained" onClick={() => setView('upload')} sx={{ mr: 1, mb:1 }}>
          Upload Photo
        </Button>
      </Box>

      <Box>  
        <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', sm: '1.5rem', md: '2rem' }, mt: 5, mb:4 }}>
            Hello, {user.signInDetails.loginId}
        </Typography>
      </Box>

      <Grid container spacing={2} direction="column">
        {/* Conditionally render components based on selected view */}
        {view === 'gallery' && (
          <Grid xs={12}>
            <Box sx={{ p: 0 }}>
              <PhotoGallery onGalleryUpdate={fetchUpdatedGallery} photos={photos} />
            </Box>
          </Grid>
        )}

        {view === 'upload' && (
          <Grid xs={12}>
            <Box sx={{ p: 0, border: '0px solid #ddd', borderRadius: 1, mb: 1 }}>
              <UploadPhoto onUploadSuccess={handleUploadSuccess} />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default withAuthenticator(App);
