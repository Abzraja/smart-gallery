import React, { useState } from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import UploadPhoto from './UploadPhoto';
import PhotoGallery from './PhotoGallery';
import DeletePhotos from './DeletePhotos';

const App = ({ signOut, user }) => {
  const [view, setView] = useState('gallery');
  console.log(user)
  return (
    <div>
      <button onClick={signOut} style={{ float: 'right' }}>
        Sign out
      </button>
      <div>
        <button onClick={() => setView('gallery')}>View Gallery</button>
        <button onClick={() => setView('upload')} style={{ marginLeft: '10px' }}>
          Upload Photo
        </button>
        <button onClick={() => setView('delete')} style={{ marginLeft: '10px' }}>
          Delete Photos
        </button>
      </div>
      <div>
      <h1>Hello, {user.signInDetails.loginId}</h1>
      UserID: {user.username}
      </div>
      {view === 'gallery' && <PhotoGallery />}
      {view === 'upload' && <UploadPhoto />}
      {view === 'delete' && <DeletePhotos />}
    </div>
  );
};

export default withAuthenticator(App);
