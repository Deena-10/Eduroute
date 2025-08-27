import React from 'react';
import { Button as MuiButton } from '@mui/material';

const Button = ({ 
  children, 
  variant = 'contained', 
  size = 'medium',
  sx = {},
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
          }
        };
      case 'outlined':
        return {
          border: '2px solid #667eea',
          color: '#667eea',
          '&:hover': {
            background: '#667eea',
            color: 'white',
            transform: 'translateY(-2px)'
          }
        };
      default:
        return {
          background: '#667eea',
          color: 'white',
          '&:hover': {
            background: '#5a6fd8',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
          }
        };
    }
  };

  return (
    <MuiButton
      variant={variant === 'gradient' ? 'contained' : variant}
      size={size}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.95rem',
        padding: '10px 24px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...getVariantStyles(),
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
