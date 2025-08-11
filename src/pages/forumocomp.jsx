import React, { useState } from 'react';
import moment from 'moment';

const ModernForumComponent = ({ 
    topicsToShow, 
    searchTerm, 
    setSearchTerm, 
    setOpenNewTopicDialog,
    setOpenNewPostDialog,
    userLikes,
    setUserLikes,
    API_URL,
    user_id,
    setSnackbarMessage,
    setSnackbarSeverity,
    setOpenSnackbar,
    handleLikePost,
    handleCreatePost,
    newPostContent,
    setNewPostContent,
    openNewPostDialog,
    setCurrentTopic,
    currentTopic
}) => {
    
    const handleTopicClick = async (topic) => {
        console.log('Topic clicked:', topic.id);
        setCurrentTopic(null);
        
        try {
            const response = await fetch(`${API_URL}/forum/topics/${topic.id}`);
            const data = await response.json();
            
            if (data && data.posts) {
                data.posts = data.posts.map(post => ({
                    ...post,
                    userLiked: userLikes[post.id] === 'like',
                    userDisliked: userLikes[post.id] === 'dislike'
                }));
            }
            setCurrentTopic(data);
        } catch (error) {
            console.error('Error fetching topic:', error);
            setSnackbarMessage('Failed to load topic. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleBackToTopics = () => {
        setCurrentTopic(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePostLike = async (postId, likeType) => {
        if (!user_id) {
            setSnackbarMessage('You must be logged in to like or dislike posts');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            if (userLikes[postId]) {
                setSnackbarMessage('You have already rated this post');
                setSnackbarSeverity('info');
                setOpenSnackbar(true);
                return;
            }
            
            const response = await fetch(`${API_URL}/post-likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post_id: postId,
                    user_id: user_id,
                    like_type: likeType
                })
            });
            
            if (!response.ok) throw new Error('Failed to like post');
            
            setUserLikes(prev => ({
                ...prev,
                [postId]: likeType
            }));
            
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

    if (currentTopic) {
        // Show selected topic view
        return (
            <div className="modern-forum-container">
                {/* Topic Header */}
                <div className="topic-view-header">
                    <button className="back-button" onClick={handleBackToTopics}>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Topics
                    </button>
                    
                    <div className="topic-info">
                        <h1 className="topic-view-title">{currentTopic.title}</h1>
                        {currentTopic.description && (
                            <p className="topic-view-description">{currentTopic.description}</p>
                        )}
                        <div className="topic-meta-info">
                            <div className="topic-creator">
                                <div className="creator-avatar">
                                    {currentTopic.creator_name?.charAt(0).toUpperCase()}
                                </div>
                                <span>Started by <strong>{currentTopic.creator_name}</strong></span>
                            </div>
                            <div className="topic-date">
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                {moment(currentTopic.created_at).format('MMM D, YYYY')}
                            </div>
                        </div>
                    </div>

                    <button className="reply-button" onClick={() => setOpenNewPostDialog(true)}>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Reply
                    </button>
                </div>

                {/* Posts List */}
                <div className="posts-container">
                    {currentTopic.posts && currentTopic.posts.length > 0 ? (
                        currentTopic.posts.map((post, index) => (
                            <div key={post.id} className={`post-card ${index === 0 ? 'first-post' : ''}`}>
                                <div className="post-header">
                                    <div className="post-author">
                                        <div className="post-avatar">
                                            {post.user_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="post-author-info">
                                            <span className="post-author-name">{post.user_name}</span>
                                            {index === 0 && <span className="starter-badge">Topic Starter</span>}
                                            <span className="post-date">
                                                {moment(post.created_at).format('MMM D, YYYY [at] h:mm A')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="post-number">#{index + 1}</div>
                                </div>
                                
                                <div className="post-content">
                                    {post.content}
                                </div>
                                
                                <div className="post-actions">
                                    <button 
                                        className={`action-button like-button ${post.userLiked ? 'active' : ''}`}
                                        onClick={() => handlePostLike(post.id, 'like')}
                                        disabled={post.userLiked || post.userDisliked}
                                    >
                                        <svg viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                        </svg>
                                        <span>{topic.post_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .modern-forum-container {
                    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                    min-height: 100vh;
                    padding: 2rem;
                }

                .forum-header {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 24px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .forum-title {
                    color: white;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem 0;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                .forum-subtitle {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 1.1rem;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .search-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    width: 1.25rem;
                    height: 1.25rem;
                    color: rgba(255, 255, 255, 0.6);
                    z-index: 1;
                }

                .search-input {
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 16px;
                    padding: 0.75rem 1rem 0.75rem 3rem;
                    color: white;
                    font-size: 1rem;
                    width: 280px;
                    transition: all 0.3s ease;
                }

                .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.6);
                }

                .search-input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                }

                .new-topic-btn {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border: none;
                    border-radius: 16px;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .new-topic-btn svg {
                    width: 1.25rem;
                    height: 1.25rem;
                }

                .new-topic-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    background: linear-gradient(135deg, #2563eb, #1e40af);
                }

                .empty-state {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 24px;
                    padding: 4rem 2rem;
                    text-align: center;
                    color: white;
                }

                .empty-icon {
                    width: 5rem;
                    height: 5rem;
                    margin: 0 auto 2rem;
                    opacity: 0.6;
                }

                .empty-icon svg {
                    width: 100%;
                    height: 100%;
                }

                .empty-title {
                    font-size: 1.75rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                .empty-subtitle {
                    font-size: 1.1rem;
                    opacity: 0.8;
                    margin-bottom: 2rem;
                    max-width: 400px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .empty-action-btn {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    padding: 1rem 2rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .empty-action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                }

                .topics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 1.5rem;
                }

                .topic-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .topic-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.3);
                }

                .topic-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
                    border-radius: 20px 20px 0 0;
                }

                .topic-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                    gap: 1rem;
                }

                .topic-title {
                    color: white;
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.4;
                    flex: 1;
                }

                .topic-meta .post-count {
                    background: rgba(59, 130, 246, 0.3);
                    color: #93c5fd;
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .topic-description {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.95rem;
                    margin: 0 0 1.5rem 0;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .topic-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .topic-author {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex: 1;
                }

                .author-avatar {
                    width: 2.5rem;
                    height: 2.5rem;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .author-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .author-name {
                    color: white;
                    font-weight: 500;
                    font-size: 0.95rem;
                }

                .topic-date {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.825rem;
                }

                .topic-stats {
                    display: flex;
                    gap: 1rem;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .stat-item svg {
                    width: 1rem;
                    height: 1rem;
                }

                .stat-item span {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .modern-forum-container {
                        padding: 1rem;
                    }

                    .forum-header {
                        padding: 1.5rem;
                    }

                    .header-content {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .forum-title {
                        font-size: 2rem;
                    }

                    .header-actions {
                        justify-content: center;
                    }

                    .search-input {
                        width: 100%;
                        min-width: 250px;
                    }

                    .topics-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .topic-footer {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ModernForumComponent;Color">
                                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                        </svg>
                                        <span>{post.likes || 0}</span>
                                    </button>
                                    
                                    <button 
                                        className={`action-button dislike-button ${post.userDisliked ? 'active' : ''}`}
                                        onClick={() => handlePostLike(post.id, 'dislike')}
                                        disabled={post.userLiked || post.userDisliked}
                                    >
                                        <svg viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                        </svg>
                                        <span>{post.dislikes || 0}</span>
                                    </button>
                                    
                                    <div className="user-status">
                                        {post.userLiked && <span className="status-liked">You liked this</span>}
                                        {post.userDisliked && <span className="status-disliked">You disliked this</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-posts">
                            <div className="empty-posts-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3>No replies yet</h3>
                            <p>Be the first to reply to this topic!</p>
                            <button className="empty-reply-button" onClick={() => setOpenNewPostDialog(true)}>
                                Post Reply
                            </button>
                        </div>
                    )}
                </div>

                <style jsx>{`
                    .modern-forum-container {
                        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                        min-height: 100vh;
                        padding: 2rem;
                    }

                    .topic-view-header {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 24px;
                        padding: 2rem;
                        margin-bottom: 2rem;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 2rem;
                        flex-wrap: wrap;
                    }

                    .back-button {
                        background: rgba(255, 255, 255, 0.2);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 12px;
                        color: white;
                        padding: 0.75rem 1rem;
                        font-size: 0.95rem;
                        font-weight: 500;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.3s ease;
                        flex-shrink: 0;
                    }

                    .back-button svg {
                        width: 1.25rem;
                        height: 1.25rem;
                    }

                    .back-button:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateX(-4px);
                    }

                    .topic-info {
                        flex: 1;
                        min-width: 0;
                    }

                    .topic-view-title {
                        color: white;
                        font-size: 2rem;
                        font-weight: 700;
                        margin: 0 0 0.5rem 0;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                    }

                    .topic-view-description {
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 1.1rem;
                        margin: 0 0 1rem 0;
                        line-height: 1.5;
                    }

                    .topic-meta-info {
                        display: flex;
                        align-items: center;
                        gap: 1.5rem;
                        flex-wrap: wrap;
                        color: rgba(255, 255, 255, 0.7);
                    }

                    .topic-creator {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .creator-avatar {
                        width: 2rem;
                        height: 2rem;
                        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: 600;
                        font-size: 0.9rem;
                    }

                    .topic-date {
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                    }

                    .topic-date svg {
                        width: 1rem;
                        height: 1rem;
                    }

                    .reply-button {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        padding: 0.75rem 1.5rem;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                        flex-shrink: 0;
                    }

                    .reply-button svg {
                        width: 1.25rem;
                        height: 1.25rem;
                    }

                    .reply-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    }

                    .posts-container {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .post-card {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 20px;
                        padding: 2rem;
                        transition: all 0.3s ease;
                    }

                    .post-card.first-post {
                        border-color: rgba(59, 130, 246, 0.5);
                        background: rgba(59, 130, 246, 0.1);
                    }

                    .post-card.first-post::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                        border-radius: 20px 20px 0 0;
                    }

                    .post-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 1.5rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }

                    .post-author {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }

                    .post-avatar {
                        width: 3rem;
                        height: 3rem;
                        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: 600;
                        font-size: 1.2rem;
                    }

                    .post-author-info {
                        display: flex;
                        flex-direction: column;
                        gap: 0.25rem;
                    }

                    .post-author-name {
                        color: white;
                        font-weight: 600;
                        font-size: 1.1rem;
                    }

                    .starter-badge {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        padding: 0.25rem 0.75rem;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        display: inline-block;
                    }

                    .post-date {
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 0.9rem;
                    }

                    .post-number {
                        color: rgba(255, 255, 255, 0.5);
                        font-size: 0.9rem;
                        font-weight: 500;
                    }

                    .post-content {
                        color: white;
                        font-size: 1.1rem;
                        line-height: 1.6;
                        margin-bottom: 1.5rem;
                    }

                    .post-actions {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        padding-top: 1rem;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                        flex-wrap: wrap;
                    }

                    .action-button {
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 12px;
                        color: rgba(255, 255, 255, 0.8);
                        padding: 0.5rem 1rem;
                        font-size: 0.9rem;
                        font-weight: 500;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.3s ease;
                    }

                    .action-button svg {
                        width: 1.25rem;
                        height: 1.25rem;
                    }

                    .action-button:hover:not(:disabled) {
                        background: rgba(255, 255, 255, 0.2);
                        transform: translateY(-1px);
                    }

                    .action-button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }

                    .like-button.active {
                        background: rgba(59, 130, 246, 0.3);
                        border-color: rgba(59, 130, 246, 0.5);
                        color: #93c5fd;
                    }

                    .dislike-button.active {
                        background: rgba(239, 68, 68, 0.3);
                        border-color: rgba(239, 68, 68, 0.5);
                        color: #fca5a5;
                    }

                    .user-status {
                        margin-left: auto;
                        font-size: 0.85rem;
                        font-style: italic;
                    }

                    .status-liked {
                        color: #93c5fd;
                    }

                    .status-disliked {
                        color: #fca5a5;
                    }

                    .empty-posts {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 20px;
                        padding: 4rem 2rem;
                        text-align: center;
                        color: white;
                    }

                    .empty-posts-icon {
                        width: 4rem;
                        height: 4rem;
                        margin: 0 auto 1.5rem;
                        opacity: 0.6;
                    }

                    .empty-posts-icon svg {
                        width: 100%;
                        height: 100%;
                    }

                    .empty-posts h3 {
                        font-size: 1.5rem;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                    }

                    .empty-posts p {
                        font-size: 1.1rem;
                        opacity: 0.8;
                        margin-bottom: 2rem;
                    }

                    .empty-reply-button {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        padding: 1rem 2rem;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    }

                    .empty-reply-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    }

                    @media (max-width: 768px) {
                        .modern-forum-container {
                            padding: 1rem;
                        }

                        .topic-view-header {
                            flex-direction: column;
                            align-items: stretch;
                            gap: 1.5rem;
                        }

                        .topic-view-title {
                            font-size: 1.5rem;
                        }

                        .post-header {
                            flex-direction: column;
                            gap: 1rem;
                        }

                        .post-actions {
                            justify-content: center;
                        }

                        .user-status {
                            margin-left: 0;
                            text-align: center;
                            width: 100%;
                        }
                    }
                `}</style>
            </div>
        );
    }

    // Show topics list (existing code)
    return (
        <div className="modern-forum-container">
            {/* Header Section */}
            <div className="forum-header">
                <div className="header-content">
                    <div className="header-text">
                        <h2 className="forum-title">Community Forums</h2>
                        <p className="forum-subtitle">Connect, discuss, and share knowledge with our community</p>
                    </div>
                    <div className="header-actions">
                        <div className="search-container">
                            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search topics..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            className="new-topic-btn"
                            onClick={() => setOpenNewTopicDialog(true)}
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Topic
                        </button>
                    </div>
                </div>
            </div>

            {/* Topics Grid */}
            {topicsToShow.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="empty-title">
                        {searchTerm ? 'No matching topics found' : 'No discussions yet'}
                    </h3>
                    <p className="empty-subtitle">
                        {searchTerm ? 'Try different keywords or create a new topic' : 'Start the conversation by creating the first topic'}
                    </p>
                    <button 
                        className="empty-action-btn"
                        onClick={() => searchTerm ? setSearchTerm('') : setOpenNewTopicDialog(true)}
                    >
                        {searchTerm ? 'Clear Search' : 'Create First Topic'}
                    </button>
                </div>
            ) : (
                <div className="topics-grid">
                    {topicsToShow.map(topic => (
                        <div 
                            key={topic.id} 
                            className="topic-card"
                            onClick={() => handleTopicClick(topic)}
                        >
                            <div className="topic-header">
                                <h3 className="topic-title">{topic.title}</h3>
                                <div className="topic-meta">
                                    <span className="post-count">
                                        {topic.post_count} replies
                                    </span>
                                </div>
                            </div>
                            
                            {topic.description && (
                                <p className="topic-description">{topic.description}</p>
                            )}
                            
                            <div className="topic-footer">
                                <div className="topic-author">
                                    <div className="author-avatar">
                                        {topic.creator_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="author-info">
                                        <span className="author-name">{topic.creator_name}</span>
                                        <span className="topic-date">
                                            {topic.last_post_date 
                                                ? `Last reply ${moment(topic.last_post_date).fromNow()}`
                                                : `Created ${moment(topic.created_at).fromNow()}`
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className="topic-stats">
                                    <div className="stat-item">
                                        <svg viewBox="0 0 20 20" fill="current