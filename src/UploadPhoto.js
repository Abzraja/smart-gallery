import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadData } from 'aws-amplify/storage';
import Box from '@mui/material/Box';


const UploadPhoto = () => {
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
        const result = await uploadData({
          path: ({ identityId }) => `private/${identityId}/${file.name}`,
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
        console.log('Upload succeeded:', result);
        alert('File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
      }
    }
  };

  return (
    <div>
      <input type="file" id="file-input" onChange={handleFileChange} style={{ display: 'none' }} />
      <label htmlFor="file-input">
        <Button sx={{ m: 1, }} variant="contained" component="span" >
          Choose File
        </Button>
      </label>
      {preview && (
        <Box sx={{ mt: 2, width: '50%', height: 'auto' }}>
          <img src={preview} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
        </Box>
      )}
      <Button sx={{ m: 1 }} variant="contained" role={undefined} tabIndex={-1} startIcon={<CloudUploadIcon />} onClick={handleUpload}>Upload Photo</Button>
    </div>
  );
};

export default UploadPhoto;
