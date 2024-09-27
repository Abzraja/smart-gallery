import React, { useState, useEffect } from 'react';
import { list, remove, getUrl } from '@aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import './DeletePhotos.css'; // Make sure to create DeletePhotos.css for styling

function DeletePhotos() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({
    deleting: false,
    error: null,
  });

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { identityId } = await fetchAuthSession();
      const result = await list({
        path: `private/${identityId}/`, // Adjust path as needed
        options: { level: 'private' }
      });

      console.log('List result:', result);

      if (result.items && Array.isArray(result.items)) {
        const photoUrls = await Promise.all(
          result.items
            .filter(photo => photo.size > 0) // Filter out folders or empty objects
            .map(async photo => {
              console.log('Photo item:', photo);
              const signedUrlObject = await getUrl({ path: photo.path, options: { level: 'private' } });
              const signedUrl = signedUrlObject.url;
              console.log(`Generated URL for ${photo.path}: ${signedUrl}`);
              return { path: photo.path, url: signedUrl };
            })
        );
        setPhotos(photoUrls);
      } else {
        console.error('Unexpected result format:', result);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleSelectPhoto = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;

    setDeleteStatus({ deleting: true, error: null });

    try {
      await remove({ path: selectedPhoto.path });
      setPhotos(photos.filter(p => p.path !== selectedPhoto.path));
      setSelectedPhoto(null);
      setDeleteStatus({ deleting: false, error: null });
    } catch (error) {
      console.error('Error deleting photo:', error);
      setDeleteStatus({ deleting: false, error: error.message || 'An error occurred while deleting the photo.' });
    }
  };

  return (
    <div className="delete-photos">
      <h2>Delete Photos</h2>
      {deleteStatus.error && (
        <div className="delete-error">{deleteStatus.error}</div>
      )}
      <div className="photo-list">
        {photos.map((photo, index) => (
          <div key={index} className="photo-item">
            <img
              src={photo.url}
              alt={`Photo ${index}`}
              onClick={() => handleSelectPhoto(photo)}
            />
          </div>
        ))}
      </div>
      {selectedPhoto && (
        <div className="selected-photo">
          <img src={selectedPhoto.url} alt="Selected" />
          <button onClick={handleDeletePhoto} disabled={deleteStatus.deleting}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default DeletePhotos;
