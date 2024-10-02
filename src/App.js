import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import UploadPhoto from './UploadPhoto';
import PhotoGallery from './PhotoGallery';
import DeletePhotos from './DeletePhotos';

const App = ({ signOut, user }) => {
  const [view, setView] = useState('gallery');
  console.log(user)
  return (
    <Box sx={{ m: '10px', p: '0px' }}>
    <div>
      <Button variant="contained" onClick={signOut} style={{ float: 'right' }}>
        Sign out
      </Button>
      <div>
        <Button onClick={() => setView('gallery')}>View Gallery</Button>
        <Button onClick={() => setView('upload')} style={{}}> Upload Image</Button>
        <Button sx={{m:'5px'}} startIcon={<DeleteIcon />} onClick={() => setView('delete')}>Delete Image</Button> 
      </div>
      <div>
      <Typography sx={{ fontSize: { xs: '0.5rem', sm: '0.75rem', md: '1rem' } }}>
      <h1>Hello, {user.signInDetails.loginId}</h1>
      </Typography>
      <div style={{ marginBottom: '30px' }}>
      {/* UserID: {user.username} */}
      </div>
      </div>
      {view === 'gallery' && <PhotoGallery />}
      {view === 'upload' && <UploadPhoto />}
      {view === 'delete' && <DeletePhotos />}
    </div>
    </Box>
  );
};

export default withAuthenticator(App);
