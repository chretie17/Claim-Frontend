import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../api';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import ForumComponent from './forumocomp'; // Add this import
import SuccessStoriesComponent from './SuccessStory'; // Add this import

const clientPost = () => {
    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState([]);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openNewTopicDialog, setOpenNewTopicDialog] = useState(false);
    const [openNewPostDialog, setOpenNewPostDialog] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicDescription, setNewTopicDescription] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [successStories, setSuccessStories] = useState([]);
  
    const [activeTab, setActiveTab] = useState('forums');
    const [userLikes, setUserLikes] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [openNewStoryDialog, setOpenNewStoryDialog] = useState(false);
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [newStoryContent, setNewStoryContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [topicsToShow, setTopicsToShow] = useState([]);
    

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const user_id = user?.id;
    
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    // Effect to filter topics based on search term
    useEffect(() => {
        if (topics.length > 0) {
            if (searchTerm.trim() === '') {
                setTopicsToShow(topics);
            } else {
                const filtered = topics.filter(topic => 
                    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    topic.creator_name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setTopicsToShow(filtered);
            }
        }
    }, [searchTerm, topics]);

    const fetchData = async () => {
        if (!user_id) {
            setLoading(false);
            setSnackbarMessage('You must be logged in to access this feature');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
            return;
        }
        
        setLoading(true);
        try {
            // Fetch forum topics
            const topicsResponse = await axios.get(`${API_URL}/forum/topics`);
            const topicsWithFixedCounts = topicsResponse.data.map(topic => ({
                ...topic,
                post_count: topic.post_count || 0 // Ensure post_count is never null
            }));
            setTopics(topicsWithFixedCounts);
            setTopicsToShow(topicsWithFixedCounts);
            
            // Fetch success stories
            const storiesResponse = await axios.get(`${API_URL}/success-stories`);
            setSuccessStories(storiesResponse.data);
            
            // Fetch user likes
            if (user_id) {
                try {
                    const likesResponse = await axios.get(`${API_URL}/post-likes/user/${user_id}`);
                    const likesMap = {};
                    likesResponse.data.forEach(like => {
                        likesMap[like.post_id] = like.like_type;
                    });
                    setUserLikes(likesMap);
                } catch (error) {
                    console.error('Error fetching user likes:', error);
                }
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setSnackbarMessage('Failed to load data. Please try again later.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            setLoading(false);
        }
    };

    const handleCreateTopic = async () => {
        if (!newTopicTitle.trim()) {
            setSnackbarMessage('Topic title is required');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            await axios.post(`${API_URL}/forum/topics`, {
                title: newTopicTitle,
                description: newTopicDescription,
                created_by: user_id
            });
            
            setOpenNewTopicDialog(false);
            setNewTopicTitle('');
            setNewTopicDescription('');
            setSnackbarMessage('Topic created successfully');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Refresh the topics list
            fetchData();
        } catch (error) {
            console.error('Error creating topic:', error);
            setSnackbarMessage('Failed to create topic. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            setSnackbarMessage('Post content is required');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            await axios.post(`${API_URL}/forum/posts`, {
                topic_id: currentTopic.id,
                user_id: user_id,
                content: newPostContent
            });
            
            setOpenNewPostDialog(false);
            setNewPostContent('');
            setSnackbarMessage('Post added successfully');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Refresh the current topic to include the new post
            const topicResponse = await axios.get(`${API_URL}/forum/topics/${currentTopic.id}`);
            
            // Process posts with user likes data
            if (topicResponse.data && topicResponse.data.posts) {
                topicResponse.data.posts = topicResponse.data.posts.map(post => ({
                    ...post,
                    userLiked: userLikes[post.id] === 'like',
                    userDisliked: userLikes[post.id] === 'dislike'
                }));
            }
            
            setCurrentTopic(topicResponse.data);
            
            // Also update the post count in the topics list
            setTopics(prevTopics => {
                return prevTopics.map(topic => {
                    if (topic.id === currentTopic.id) {
                        return {
                            ...topic,
                            post_count: (topic.post_count || 0) + 1,
                            last_post_date: new Date()
                        };
                    }
                    return topic;
                });
            });
            
            // Update filtered topics as well
            setTopicsToShow(prevTopics => {
                return prevTopics.map(topic => {
                    if (topic.id === currentTopic.id) {
                        return {
                            ...topic,
                            post_count: (topic.post_count || 0) + 1,
                            last_post_date: new Date()
                        };
                    }
                    return topic;
                });
            });
        } catch (error) {
            console.error('Error creating post:', error);
            setSnackbarMessage('Failed to add post. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    // Handle post like/dislike
    const handleLikePost = async (postId, likeType) => {
        if (!user_id) {
            setSnackbarMessage('You must be logged in to like or dislike posts');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            // Check if user has already liked/disliked this post
            if (userLikes[postId]) {
                setSnackbarMessage('You have already rated this post');
                setSnackbarSeverity('info');
                setOpenSnackbar(true);
                return;
            }
            
            // Make API call to record the like/dislike
            await axios.post(`${API_URL}/post-likes`, {
                post_id: postId,
                user_id: user_id,
                like_type: likeType
            });
            
            // Update local state
            setUserLikes(prev => ({
                ...prev,
                [postId]: likeType
            }));
            
            // Update the post like/dislike count in the currentTopic posts array
            if (currentTopic) {
                const updatedPosts = currentTopic.posts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            likes: likeType === 'like' ? (post.likes || 0) + 1 : post.likes,
                            dislikes: likeType === 'dislike' ? (post.dislikes || 0) + 1 : post.dislikes,
                            userLiked: likeType === 'like',
                            userDisliked: likeType === 'dislike'
                        };
                    }
                    return post;
                });
                
                setCurrentTopic({
                    ...currentTopic,
                    posts: updatedPosts
                });
            }
            
            setSnackbarMessage(`Post ${likeType === 'like' ? 'liked' : 'disliked'} successfully`);
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (error) {
            console.error(`Error ${likeType}ing post:`, error);
            setSnackbarMessage(`Failed to ${likeType} post. Please try again.`);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleSubmitStory = async () => {
        if (!newStoryTitle.trim() || !newStoryContent.trim()) {
            setSnackbarMessage('Title and content are required');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            await axios.post(`${API_URL}/success-stories`, {
                user_id: user_id,
                title: newStoryTitle,
                content: newStoryContent,
                is_anonymous: isAnonymous
            });
            
            setOpenNewStoryDialog(false);
            setNewStoryTitle('');
            setNewStoryContent('');
            setIsAnonymous(false);
            setSnackbarMessage('Success story submitted for approval');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Refresh success stories
            const storiesResponse = await axios.get(`${API_URL}/success-stories`);
            setSuccessStories(storiesResponse.data);
        } catch (error) {
            console.error('Error submitting story:', error);
            setSnackbarMessage('Failed to submit story. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-blue-800">
                            <span className="border-b-4 border-blue-500 pb-1">client Hub</span>
                        </h1>
                        <div className="hidden md:flex space-x-2">
                            <div className="flex items-center text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                <span className="font-medium">{topics.length} Topics</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                </svg>
                                <span className="font-medium">{successStories.length} Success Stories</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => {
                                setActiveTab('forums');
                                setCurrentTopic(null);
                            }}
                            className={`py-3 px-6 font-medium text-sm mr-4 transition-colors duration-200 ${activeTab === 'forums' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                </svg>
                                Discussion Forums
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('success-stories');
                                setCurrentTopic(null);
                            }}
                            className={`py-3 px-6 font-medium text-sm transition-colors duration-200 ${activeTab === 'success-stories' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Success Stories
                            </div>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="text-blue-600 mt-4 font-medium">Loading client content...</p>
                        </div>
                    ) : (
                        <>
                           {activeTab === 'forums' && (
    <ForumComponent
        topics={topics}
        topicsToShow={topicsToShow}
        currentTopic={currentTopic}
        setCurrentTopic={setCurrentTopic}
        userLikes={userLikes}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        user_id={user_id}
        fetchData={fetchData}
        setSnackbarMessage={setSnackbarMessage}
        setSnackbarSeverity={setSnackbarSeverity}
        setOpenSnackbar={setOpenSnackbar}
    />
)}
                            
                           {activeTab === 'success-stories' && (
    <SuccessStoriesComponent
        successStories={successStories}
        user_id={user_id}
        fetchData={fetchData}
        setSnackbarMessage={setSnackbarMessage}
        setSnackbarSeverity={setSnackbarSeverity}
        setOpenSnackbar={setOpenSnackbar}
    />
)}
                        </>
                    )}
                </div>
            </div>
            
            {/* New Topic Dialog */}
            <Dialog 
                open={openNewTopicDialog} 
                onClose={() => setOpenNewTopicDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '0.75rem' }
                }}
            >
                <DialogTitle>
                    <div className="flex items-center text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Create New Topic
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 text-blue-700 text-sm">
                        <p>Start a conversation by creating a new topic. Clear and descriptive titles help others find and join your discussion.</p>
                    </div>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Topic Title"
                        type="text"
                        fullWidth
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-4"
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Description (Optional)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={newTopicDescription}
                        onChange={(e) => setNewTopicDescription(e.target.value)}
                        variant="outlined"
                        placeholder="Add a brief description to give context about your topic"
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewTopicDialog(false)} 
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateTopic} 
                        variant="contained" 
                        color="primary"
                        className="bg-blue-600 hover:bg-blue-700"
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Create Topic
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* New Post Dialog */}
            <Dialog 
                open={openNewPostDialog} 
                onClose={() => setOpenNewPostDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '0.75rem' }
                }}
            >
                <DialogTitle>
                    <div className="flex items-center text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Reply to: {currentTopic?.title}
                    </div>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Reply"
                        type="text"
                        fullWidth
                        multiline
                        rows={8}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        required
                        variant="outlined"
                        placeholder="Share your thoughts, experiences, or questions..."
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewPostDialog(false)}
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreatePost}
                        variant="contained" 
                        color="primary"
                        className="bg-blue-600 hover:bg-blue-700"
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Post Reply
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* New Success Story Dialog */}
            <Dialog 
                open={openNewStoryDialog} 
                onClose={() => setOpenNewStoryDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '0.75rem' }
                }}
            >
                <DialogTitle>
                    <div className="flex items-center text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Share Your Success Story
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-blue-700 text-sm">
                                Your story will be reviewed by our team before being published. Share your experience to inspire others in the client!
                            </p>
                        </div></div>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Story Title"
                        type="text"
                        fullWidth
                        value={newStoryTitle}
                        onChange={(e) => setNewStoryTitle(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-4"
                        placeholder="Give your success story a compelling title"
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Your Success Story"
                        type="text"
                        fullWidth
                        multiline
                        rows={8}
                        value={newStoryContent}
                        onChange={(e) => setNewStoryContent(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-4"
                        placeholder="Share your journey, challenges, and how you overcame them"
                        InputProps={{
                            style: { borderRadius: '0.5rem' }
                        }}
                    />
                    <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                        <input
                            type="checkbox"
                            id="anonymous"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="anonymous" className="ml-2 text-gray-700">
                            Post anonymously
                        </label>
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewStoryDialog(false)}
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmitStory}
                        variant="contained" 
                        color="primary"
                        className="bg-blue-600 hover:bg-blue-700"
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '0.5rem',
                            padding: '8px 16px'
                        }}
                    >
                        Submit Story
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={5000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setOpenSnackbar(false)} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default clientPost;