import React, { useState } from 'react';
import { Box, Modal, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function PhotoModal({ open, handleClose, selectedPhoto, handleDeleteConfirm }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteButtonClick = () => {
    setConfirmDelete(true); // Show confirm delete button
  };

  const handleConfirmDelete = () => {
    handleDeleteConfirm(selectedPhoto); // Call the delete function from parent
    setConfirmDelete(false); // Reset confirmation state
  };

  const handleModalClose = () => {
    setConfirmDelete(false); // Reset confirm delete state when modal closes
    handleClose(); // Call parent handleClose
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose} // Use the updated handleClose function
      aria-labelledby="photo-modal-title"
      aria-describedby="photo-modal-description"
      sx={{
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(5px)',
        },
        '& .MuiModal-root': {
          outline: 'none',
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
          maxWidth: '95%',
          maxHeight: '95%',
          outline: 'none',
        }}
      >
        <img
          src={selectedPhoto?.url}
          alt="Preview"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '100vw',
            maxHeight: '100vh',
            objectFit: 'contain',
            border: 'none',
            outline: 'none',
            display: 'block',
          }}
        />
        <span
          onClick={handleModalClose}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '10px',
            fontSize: '35px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#FFF',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
            zIndex: 1100,
          }}
        >
          &times;
        </span>

        {/* Delete icon inside the modal */}
        <IconButton
          onClick={handleDeleteButtonClick}
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            color: '#FFF',
            backgroundColor: 'error.main',
            '&:hover': {
              backgroundColor: 'error.dark'
            }
          }}
        >
          <DeleteIcon />
        </IconButton>

        {/* Confirm Delete Button */}
        {confirmDelete && (
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1100,
            }}
          >
            Confirm Delete
          </Button>
        )}
      </Box>
    </Modal>
  );
}

export default PhotoModal;
