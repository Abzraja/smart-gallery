import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { list, getUrl, remove } from '@aws-amplify/storage';
import { fetchAuthSession } from '@aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { listPhotoTags } from './graphql/queries';
import awsconfig from './aws-exports';
import './PhotoGallery.css';
import { Amplify } from 'aws-amplify';
// Configure Amplify
Amplify.configure(awsconfig);

const client = generateClient();

function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        // Get the current authenticated user's ID
        const { identityId } = await fetchAuthSession();

        // List photos in the private folder for the authenticated user
        const result = await list({
          path: `private/${identityId}/`,
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

                // Fetch tags from GraphQL API
                const tags = await fetchTagsFromAPI(photo.path);

                return { path: photo.path, url: signedUrl, tags };
              })
          );
          setPhotos(photoUrls);
          extractUniqueTags(photoUrls);
        } else {
          console.error('Unexpected result format:', result);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };
    fetchPhotos();
  }, []);

  const fetchTagsFromAPI = async (photoPath) => {
    try {
      console.log(`Querying tags for photoPath: ${photoPath}`); // Debug log
      const result = await client.graphql({
        query: listPhotoTags,
        variables: {
          filter: {
            PhotoID: { eq: photoPath }
          }
        }
      });
      console.log('GraphQL query result:', result); // Log entire result
      const photoTagRecords = result.data.listPhotoTags.items;
      console.log('Fetched photo tag records:', photoTagRecords);
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
    setSelectedPhoto(photo);
  };

  const closePreview = () => {
    setSelectedPhoto(null);
  };

  const handleTagSelection = (tag) => {
    setSelectedTags(prevTags => prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]);
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

  // const filteredPhotos = photos.filter(photo => selectedTags.every(tag => photo.tags.includes(tag)));
  const filteredPhotos = selectedTags.length > 0 
  ? photos.filter(photo => selectedTags.some(tag => photo.tags.includes(tag)))
  : photos;

  return (
    
    <div className="photo-gallery">
      <div className="tag-filter">
        {tags.map(tag => (
          <Button sx={{ m: 0.5,
            boxShadow: selectedTags.includes(tag) ? 6 : 1,  // Elevation levels (6 for selected, 1 for default)
           }} 
           variant="contained"
            key={tag}
            // className={`tag-button ${selectedTags.includes(tag) ? 'selected' : ''}`}
            color={selectedTags.includes(tag) ? "secondary" : "primary"}  // Changes color based on selection
            onClick={() => handleTagSelection(tag)}
          >
            {tag}
          </Button>
        ))}
      </div>

      <div className="photos">
        {filteredPhotos.map((photo, index) => (
          <div key={index} className="photo-item" >
            <img src={photo.url} alt="Uploaded" onClick={() => openPreview(photo)} />
            <IconButton className="delete-icon" onClick={() => handleDeleteClick(photo)} aria-label="delete"
        size="small">
            <DeleteIcon fontSize="small"/>
            </IconButton>
            {deleteConfirm && deleteConfirm.path === photo.path && (
              <Button variant="contained" color="primary" onClick={handleDeleteConfirm}>
                Confirm Delete
              </Button>
            )}
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close" onClick={closePreview}>&times;</span>
            <img src={selectedPhoto.url} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  
  );
}

export default PhotoGallery;
