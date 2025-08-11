import React from 'react';
import moment from 'moment';

const ModernForumComponent = ({ 
    topicsToShow, 
    searchTerm, 
    setSearchTerm, 
    setOpenNewTopicDialog, 
    onTopicClick
}) => {
    
    const handleTopicClick = (topic) => {
        console.log('Topic clicked:', topic.id); // Debug log
        if (onTopicClick) {
            onTopicClick(topic);
        }
    };

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

export default ModernForumComponent;