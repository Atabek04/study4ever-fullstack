import { useState } from 'react';
import {
  Box,
  Chip,
  Fade,
  Collapse,
  Button,
  Typography,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const CourseFilters = ({ onSort, activeSort, onClear }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const sortOptions = [
    { id: 'titleAsc', label: 'Title (A-Z)', field: 'title', order: 'asc' },
    { id: 'titleDesc', label: 'Title (Z-A)', field: 'title', order: 'desc' },
    { id: 'newest', label: 'Newest First', field: 'id', order: 'desc' },
    { id: 'oldest', label: 'Oldest First', field: 'id', order: 'asc' },
  ];

  const handleSort = (sortOption) => {
    onSort(sortOption);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Button
          variant="text"
          color="primary"
          size="small"
          startIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          onClick={toggleExpand}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {expanded ? 'Hide Filters' : 'Show Filters'}
        </Button>
        
        {activeSort && (
          <Fade in={!!activeSort}>
            <Chip 
              label={`Sorted by: ${sortOptions.find(opt => opt.id === activeSort)?.label || 'Custom'}`}
              onDelete={onClear}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ 
                fontWeight: 500,
                '& .MuiChip-deleteIcon': {
                  color: 'primary.main',
                }
              }}
            />
          </Fade>
        )}
      </Box>
      
      <Collapse in={expanded}>
        <Paper
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 2, 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Box>
            <Typography 
              variant="subtitle2" 
              fontWeight={600} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5 
              }}
            >
              <SortIcon sx={{ fontSize: 18, mr: 1 }} />
              Sort Courses
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1 
            }}>
              {sortOptions.map((option) => (
                <Chip
                  key={option.id}
                  label={option.label}
                  clickable
                  onClick={() => handleSort(option.id)}
                  color={activeSort === option.id ? 'primary' : 'default'}
                  variant={activeSort === option.id ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 500,
                    borderRadius: 1.5,
                    '&.MuiChip-colorPrimary': {
                      backgroundColor: 'primary.main',
                      color: '#FFF5E0',
                    }
                  }}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default CourseFilters;
