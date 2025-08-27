import React from 'react';
import { Box, Container } from '@mui/material';

const PageContainer = ({ children, maxWidth = 'lg', sx = {} }) => {
  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        minHeight: 'calc(100vh - 80px)', // Account for navbar height
        ...sx
      }}
    >
      {children}
    </Container>
  );
};

export default PageContainer;
