import React from 'react';
import { Box, Modal } from '@mui/material';

function PhotoModal({ open, handleClose, selectedPhoto }) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="photo-modal-title"
      aria-describedby="photo-modal-description"
      sx={{
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(5px)', // Optional: add a blur effect to the background
        },
        '& .MuiModal-root': {
          outline: 'none', // Remove outline from the modal
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          maxWidth: '90vw',
          maxHeight: '90vh',
          outline: 'none', // Ensure modal content has no outline
        }}
      >
        <img
          src={selectedPhoto?.url}
          alt="Preview"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            border: 'none',
            outline: 'none', // Ensure no outline
            display: 'block', // Prevent any inline spacing issues
          }}
          onFocus={(e) => (e.target.style.outline = 'none')} // Remove outline on focus
          onBlur={(e) => (e.target.style.outline = 'none')} // Ensure outline is removed on blur
        />
        <span
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '-10px', // Adjust this value to position it correctly
            right: '10px', // Adjust this value to position it correctly
            fontSize: '35px', // Increase the size for better visibility
            fontWeight: 'bold', // Make it bold
            cursor: 'pointer',
            color: '#FFF', // Change the color to red or any prominent color
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)', // Add a shadow for better contrast
            zIndex: 1100, // Ensure it stays above other elements
          }}
        >
          &times;
        </span>
      </Box>
    </Modal>
  );
}

export default PhotoModal;
