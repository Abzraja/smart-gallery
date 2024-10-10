import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadData } from 'aws-amplify/storage';
import Box from '@mui/material/Box';
import { fetchAuthSession } from '@aws-amplify/auth'; // Import for getting identityId
import Typography from '@mui/material/Typography';

const UploadPhoto = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (file) {
      try {
        const { identityId } = await fetchAuthSession(); // Get identityId for the user
        const path = `private/${identityId}/${file.name}`; // Construct the upload path
  
        const result = await uploadData({
          path: path,
          data: file,
          options: {
            contentType: file.type,
            onProgress: ({ transferredBytes, totalBytes }) => {
              if (totalBytes) {
                console.log(`Upload progress ${Math.round((transferredBytes / totalBytes) * 100)} %`);
              }
            },
          },
        }).result;
  
        // Construct the new photo object
        const newPhoto = { path, url: result.key }; // Include the S3 key as the URL
  
        // Call the onUploadSuccess callback and pass the new photo
        if (onUploadSuccess) {
          onUploadSuccess(newPhoto);
        }
  
        alert('File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');

          // Reset preview and file after successful upload
          setFile(null);
          setPreview(null);


      }
    }
  };


  return (
    <div>
      <input type="file" id="file-input" onChange={handleFileChange} style={{ display: 'none' }} />
      <label htmlFor="file-input">
        <Button sx={{ m: 1 }} variant="contained" component="span" tabIndex={-1} startIcon={<CloudUploadIcon />}>
          UPLOAD IMAGE
        </Button>
      </label>
      <Typography>*only .jpg and .png files accepted</Typography>
      {preview && (
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '400px',
            overflow: 'hidden',
          }}
        >
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
            }}
          />
          <Button sx={{ mt: 2 }} variant="contained" onClick={handleUpload}>
            Submit
          </Button>
        </Box>
      )}
    </div>
  );
};

export default UploadPhoto;
