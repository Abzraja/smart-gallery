import React, { useState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { list, getUrl, remove } from '@aws-amplify/storage';
import { fetchAuthSession } from '@aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { listPhotoTags } from './graphql/queries';
import awsconfig from './aws-exports';
import { Amplify } from 'aws-amplify';
import PhotoModal from './PhotoModal';
import './PhotoGallery.css';
import Grid from '@mui/material/Grid2'; // Use Grid2 import

// Configure Amplify
Amplify.configure(awsconfig);

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

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      try {
        await remove({ path: deleteConfirm.path });
        setPhotos(photos.filter(p => p.path !== deleteConfirm.path));
        setDeleteConfirm(null);
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

  const addPhoto = (newPhoto) => {
    setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
    extractUniqueTags([...photos, newPhoto]);
  };

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
          <Grid item xs={6} sm={4} md={3} key={index} className="photo-item">
            <div className="photo-wrapper" style={{ position: 'relative' }}> {/* Ensure relative positioning for the photo-wrapper */}
              <img 
                src={photo.url} 
                alt="Uploaded" 
                onClick={() => openPreview(photo)} 
                className="photo-thumbnail"
              />
              <IconButton
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(photo);
                }}
                aria-label="delete"
                size="small"
                sx={{ position: 'absolute', top: 5, right: 5 }} // Position delete icon
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
            {deleteConfirm && deleteConfirm.path === photo.path && ( 
              <Button
                variant="contained"
                color="primary"
                className="confirm-delete-button"
                onClick={handleDeleteConfirm}
                fullWidth
                sx={{ mt: 1 }} // Added margin for spacing using MUI system props
              >
                Confirm Delete
              </Button>
            )}
          </Grid>
        ))}
      </Grid>
  
      <PhotoModal
        open={!!selectedPhoto}
        handleClose={closePreview}
        selectedPhoto={selectedPhoto}
      />
    </div>
  );
  
}

export default PhotoGallery;
