import { Box } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const NoResultsIllustration = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 120,
        height: 120,
        borderRadius: '50%',
        backgroundColor: 'rgba(199, 0, 57, 0.08)',
      }}
    >
      <SearchOffIcon 
        sx={{ 
          fontSize: 64, 
          color: 'primary.main'
        }} 
      />
    </Box>
  );
};

export default NoResultsIllustration;
