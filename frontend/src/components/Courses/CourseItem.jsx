import {useEffect, useState} from 'react';
import {getCourseImageUrl} from "../../utils/courseImageUtils.js";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    IconButton,
    Snackbar,
    Tooltip,
    Typography
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {useEnrolledCourseIds, useEnrollment, useInstructor} from '../../hooks/courseHooks';
import CourseDetailModal from './CourseDetailModal';

const CourseItem = ({course}) => {
    const {enrollInCourse, enrolling, enrollmentSuccess} = useEnrollment();
    const [notification, setNotification] = useState({open: false, message: '', severity: 'success'});
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    // Fetch enrolled course IDs
    const {enrolledCourseIds, mutate: refreshEnrolledCourses} = useEnrolledCourseIds();

    // Fetch instructor details
    const {instructor, loading: instructorLoading} = useInstructor(course.instructorId);

    // Check if the course is already enrolled
    useEffect(() => {
        if (enrolledCourseIds && course.id) {
            // Course IDs could be stored as strings or numbers, so use loose equality
            const enrolled = enrolledCourseIds.some(id => id == course.id);
            setIsEnrolled(enrolled);
        }
    }, [enrolledCourseIds, course.id]);

    // Refresh enrolled courses when enrollment is successful
    useEffect(() => {
        if (enrollmentSuccess) {
            refreshEnrolledCourses();
        }
    }, [enrollmentSuccess, refreshEnrolledCourses]);

    // Fallback image if course thumbnail fails to load
    const fallbackImage = 'https://picsum.photos/400/140?blur=2';

    // Generate a random image based on course id for demo purposes
    const courseImage = getCourseImageUrl(course);

    const truncateDescription = (text, maxLength = 120) => {
        if (!text) return 'No description available';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    const handleEnroll = async () => {
        try {
            // Extract course details for the enrollment request
            const courseDetails = {
                totalLessons: course.lessonsCount || course.totalLessons || course.lessons?.length,
                totalModules: course.modulesCount || course.totalModules || course.modules?.length,
                // Default values will be used in the hook if these are undefined
            };

            const success = await enrollInCourse(course.id, courseDetails);

            setNotification({
                open: true,
                message: success
                    ? `Successfully enrolled in "${course.title}"!`
                    : 'Failed to enroll in course. Please try again.',
                severity: success ? 'success' : 'error'
            });

            // If enrollment was successful, refresh the enrolled courses list
            if (success) {
                await refreshEnrolledCourses();
            }
        } catch (error) {
            setNotification({
                open: true,
                message: 'Failed to enroll in course. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({...prev, open: false}));
    };

    const openDetailModal = () => {
        setDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setDetailModalOpen(false);
    };

    return (
        <>
            <Card
                sx={{
                    borderRadius: 3,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    maxWidth: 380,
                    minWidth: 260,
                    margin: '0 auto',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                    overflow: 'hidden',
                    backgroundColor: '#F9EFD6',
                    position: 'relative'
                }}
                elevation={1}
            >
                <Tooltip title="View course details" placement="top">
                    <IconButton
                        size="small"
                        onClick={openDetailModal}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                            }
                        }}
                    >
                        <InfoOutlinedIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>

                <CardMedia
                    component="img"
                    image={course.thumbnail || courseImage}
                    alt={course.title}
                    sx={{
                        height: 120, // Reduced from 160 to 120 for a more compact look
                        objectFit: 'cover',
                        objectPosition: 'center',
                        background: '#f3f6f9',
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                    }}
                    onClick={openDetailModal}
                    style={{cursor: 'pointer'}}
                />
                <CardContent sx={{flexGrow: 1, pt: 2.5, pb: 1, px: 3}}>
                    <Tooltip title={course.title} placement="top" arrow>
                        <Typography
                            gutterBottom
                            variant="h6"
                            fontWeight={700}
                            component="div"
                            sx={{
                                fontSize: '1.2rem',
                                mb: 1.5,
                                lineHeight: 1.3,
                                color: '#141E46',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                height: 48,
                                cursor: 'pointer'
                            }}
                            onClick={openDetailModal}
                        >
                            {course.title}
                        </Typography>
                    </Tooltip>

                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <PersonIcon sx={{fontSize: 18, color: 'text.secondary', mr: 0.7}}/>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={500}
                            sx={{minHeight: 24}}
                        >
                            {instructorLoading
                                ? 'Loading instructor...'
                                : instructor
                                    ? `${instructor.firstName} ${instructor.lastName}`
                                    : 'Unknown Instructor'}
                        </Typography>
                    </Box>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 0,
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            lineHeight: 1.5,
                            height: 30,
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}
                        onClick={openDetailModal}
                    >
                        {truncateDescription(course.description)}
                    </Typography>
                </CardContent>
                <CardActions sx={{p: 3, pt: 1, pb: 2.5, display: 'flex', justifyContent: 'center'}}>
                    {isEnrolled ? (
                        <Button
                            size="large"
                            variant="outlined"
                            color="success"
                            fullWidth
                            disabled={true}
                            startIcon={<CheckCircleIcon/>}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: 'none',
                                py: 1.2,
                                fontSize: '1rem',
                                borderWidth: 2,
                                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                            }}
                        >
                            Already Enrolled
                        </Button>
                    ) : (
                        <Button
                            size="large"
                            variant="contained"
                            color="secondary"
                            fullWidth
                            disabled={enrolling}
                            onClick={handleEnroll}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: 'none',
                                py: 1.2,
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(255, 105, 105, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(255, 105, 105, 0.4)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                        </Button>
                    )}
                </CardActions>
            </Card>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{width: '100%'}}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            <CourseDetailModal
                course={course}
                open={detailModalOpen}
                onClose={closeDetailModal}
            />
        </>
    );
};

export default CourseItem;
