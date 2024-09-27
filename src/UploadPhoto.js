import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';


const UploadPhoto = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Photo</button>
    </div>
  );
};

export default UploadPhoto;
