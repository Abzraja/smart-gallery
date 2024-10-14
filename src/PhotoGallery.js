import React, { useState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import { list, getUrl, remove } from '@aws-amplify/storage';
import { fetchAuthSession } from '@aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { listPhotoTags } from './graphql/queries';
import PhotoModal from './PhotoModal';
import './PhotoGallery.css';
import Grid from '@mui/material/Grid2'; // Use Grid2 import


const client = generateClient();

function PhotoGallery({ onGalleryUpdate }) {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const { identityId } = await fetchAuthSession();
      const result = await list({
        path: `private/${identityId}/`,
        options: { level: 'private' }
      });

      if (result.items && Array.isArray(result.items)) {
        const photoUrls = await Promise.all(
          result.items
            .filter(photo => photo.size > 0)
            .map(async photo => {
              const signedUrlObject = await getUrl({ path: photo.path, options: { level: 'private' } });
              const signedUrl = signedUrlObject.url;
              const tags = await fetchTagsFromAPI(photo.path);
              return { path: photo.path, url: signedUrl, tags };
            })
        );
        setPhotos(photoUrls);
        extractUniqueTags(photoUrls);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const fetchTagsFromAPI = async (photoPath) => {
    try {
      const result = await client.graphql({
        query: listPhotoTags,
        variables: {
          filter: {
            PhotoID: { eq: photoPath }
          }
        }
      });
      const photoTagRecords = result.data.listPhotoTags.items;
      return photoTagRecords.length > 0 ? photoTagRecords[0].Tags : [];
    } catch (error) {
      console.error('Error fetching tags from API:', error);
      return [];
    }
  };

  const extractUniqueTags = (photoUrls) => {
    const allTags = photoUrls.flatMap(photo => photo.tags);
    setTags([...new Set(allTags)]);
  };

  const openPreview = (photo) => {
    setDeleteConfirm(null);
    setSelectedPhoto(photo);
  };

  const closePreview = () => {
    setSelectedPhoto(null);
  };

  const handleTagSelection = (tag) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
    );
  };

  const handleDeleteClick = (photo) => {
    setDeleteConfirm(photo);
  };

  const handleDeleteConfirm = async (photo) => {
    if (photo) {
      try {
        await remove({ path: photo.path });
        setPhotos(photos.filter(p => p.path !== photo.path));
        setSelectedPhoto(null); // Close modal after deletion
        console.log('Photo deleted:', photo.path); // Log for debugging
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }
  };

  const handleClickAway = useCallback((event) => {
    if (deleteConfirm && 
        !event.target.closest('.delete-icon') && 
        !event.target.closest('.confirm-delete-button')) {
      setDeleteConfirm(null);
    }
  }, [deleteConfirm]);

  useEffect(() => {
    document.addEventListener('click', handleClickAway);
    return () => {
      document.removeEventListener('click', handleClickAway);
    };
  }, [handleClickAway]);

  const filteredPhotos = selectedTags.length > 0 
    ? photos.filter(photo => selectedTags.some(tag => photo.tags.includes(tag)))
    : photos;

  useEffect(() => {
    if (onGalleryUpdate) {
      onGalleryUpdate(filteredPhotos);
    }
  }, [filteredPhotos, onGalleryUpdate]);

  // const addPhoto = (newPhoto) => {
  //   setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
  //   extractUniqueTags([...photos, newPhoto]);
  // };

  return (
  <div className="photo-gallery">
    <div className="tag-filter">
      {tags.map(tag => (
        <Button
          sx={{ m: 0.5, boxShadow: selectedTags.includes(tag) ? 6 : 1 }}
          variant="contained"
          key={tag}
          color={selectedTags.includes(tag) ? "secondary" : "primary"}
          onClick={() => handleTagSelection(tag)}
        >
          {tag}
        </Button>
      ))}
    </div>

    <Grid container spacing={2} className="photos">
  {filteredPhotos.map((photo, index) => (
    <Grid
      item
      xs={6} sm={4} md={3}
      key={index}
      className="photo-item"
      container
      direction="column"
      alignItems="center"
    > 
      {/* Use a flexbox layout for vertical alignment */}
      
      <div className="photo-wrapper" style={{ position: 'relative', width: '100%' }}> 
        {/* Ensure relative positioning for the photo-wrapper */}
        <img 
          src={photo.url} 
          alt="Uploaded" 
          onClick={() => openPreview(photo)} 
          className="photo-thumbnail"
          style={{ width: '100%', objectFit: 'cover' }}  // Ensure consistent image size
        />
      </div>
    </Grid>
  ))}
</Grid>



    <PhotoModal
      open={!!selectedPhoto}
      handleClose={closePreview}
      selectedPhoto={selectedPhoto}
      handleDeleteConfirm={handleDeleteConfirm} // Pass delete function to modal
    />
  </div>
);

}

export default PhotoGallery;