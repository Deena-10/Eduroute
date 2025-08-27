import React from 'react';
import { Paper, Box } from '@mui/material';

const Card = ({ 
  children, 
  elevation = 2, 
  sx = {}, 
  hover = true,
  onClick,
  ...props 
}) => {
  return (
    <Paper
      elevation={elevation}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': hover ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
          ...sx['&:hover']
        } : {},
        ...sx
      }}
      {...props}
    >
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Paper>
  );
};

export default Card;
