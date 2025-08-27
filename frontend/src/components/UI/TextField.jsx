import React from 'react';
import { TextField as MuiTextField } from '@mui/material';

const TextField = ({ 
  sx = {}, 
  variant = 'outlined',
  ...props 
}) => {
  return (
    <MuiTextField
      variant={variant}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          '&:hover fieldset': {
            borderColor: '#667eea',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#667eea',
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#667eea',
        },
        ...sx
      }}
      {...props}
    />
  );
};

export default TextField;
