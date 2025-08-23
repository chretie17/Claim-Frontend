import React, { useState, useEffect } from 'react';
import API_URL from '../api';
import axios from 'axios';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [userForm, setUserForm] = useState({ username: '', name: '', email: '', phone: '', address: '', role: 'client', password: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [tempPassword, setTempPassword] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 8000);
    };

    const validateForm = () => {
        if (!userForm.username.trim()) {
            showMessage('Username is required', 'error');
            return false;
        }
        if (!userForm.name.trim()) {
            showMessage('Full name is required', 'error');
            return false;
        }
        if (!userForm.email.trim()) {
            showMessage('Email is required', 'error');
            return false;
        }

        if (userForm.username.length < 3) {
            showMessage('Username must be at least 3 characters long', 'error');
            return false;
        }
        return true;
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${API_URL}/users/${id}`);
                fetchUsers();
                showMessage('User deleted successfully!');
            } catch (error) {
                console.error('Error deleting user:', error);
                showMessage('Error deleting user', 'error');
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user.id);
        setUserForm({ ...user, password: '' }); // Don't overwrite password
        setShowForm(true);
        setTempPassword(''); // Clear temp password display
    };

    const handleSubmit = async () => {
        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            if (editingUser) {
                // Update existing user
                const updatedData = { ...userForm };
                if (!updatedData.password) delete updatedData.password; // Remove password if empty
                await axios.put(`${API_URL}/users/${editingUser}`, updatedData);
                showMessage('User updated successfully!');
            } else {
                // Create new user by admin
                const userData = { ...userForm };
                delete userData.password; // Remove password field as admin creates with temp password
                
                const response = await axios.post(`${API_URL}/users/admin/create-user`, userData);
                showMessage('User created successfully! Welcome email sent with temporary password.');
                
                // Show temp password (optional - remove in production)
                if (response.data.tempPassword) {
                    setTempPassword(response.data.tempPassword);
                }
            }
            fetchUsers();
            setEditingUser(null);
            setUserForm({ username: '', name: '', email: '', phone: '', address: '', role: 'client', password: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error saving user:', error);
            
            // Handle different types of errors
            let errorMessage = 'Error saving user';
            
            if (error.response?.data?.error) {
                const backendError = error.response.data.error;
                
                // Handle specific database errors
                if (backendError.includes("Duplicate entry") && backendError.includes("username")) {
                    errorMessage = 'Username already exists. Please choose a different username.';
                } else if (backendError.includes("Duplicate entry") && backendError.includes("email")) {
                    errorMessage = 'Email already exists. Please use a different email address.';
                } else if (backendError.includes("cannot be null")) {
                    errorMessage = 'All required fields must be filled out.';
                } else if (backendError.includes("Data too long")) {
                    errorMessage = 'One or more fields exceed the maximum allowed length.';
                } else {
                    // Show the actual backend error message
                    errorMessage = backendError;
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showMessage(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNewUser = () => {
        setShowForm(!showForm);
        setEditingUser(null);
        setUserForm({ username: '', name: '', email: '', phone: '', address: '', role: 'client', password: '' });
        setTempPassword('');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-blue-900 px-6 py-4 text-white">
                    <h1 className="text-4xl font-extrabold text-white tracking-wide">Manage Users</h1>
                </div>

                <div className="p-6">
                    {/* Message Display */}
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg animate-fadeIn ${
                            message.type === 'error' 
                                ? 'bg-red-100 text-red-700 border border-red-300' 
                                : 'bg-green-100 text-green-700 border border-green-300'
                        }`}>
                            <div className="flex items-start space-x-3">
                                {message.type === 'error' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium">{message.type === 'error' ? 'Error' : 'Success'}</p>
                                    <p className="text-sm mt-1">{message.text}</p>
                                </div>
                                <button 
                                    onClick={() => setMessage({ text: '', type: '' })}
                                    className={`${message.type === 'error' ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'} transition-colors`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Temp Password Display */}
                    {tempPassword && (
                        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <h3 className="font-semibold text-yellow-800 mb-2">Temporary Password Created:</h3>
                            <div className="bg-white p-3 rounded border">
                                <code className="text-lg font-mono text-gray-800">{tempPassword}</code>
                            </div>
                            <p className="text-sm text-yellow-700 mt-2">
                                The user has been emailed this temporary password. They should change it on first login.
                            </p>
                        </div>
                    )}

                    <button 
                        onClick={handleAddNewUser} 
                        className="mb-6 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>{showForm ? 'Close Form' : 'Add User'}</span>
                    </button>

                    {showForm && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 mb-6 animate-fadeIn">
                            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h2>
                            
                            {!editingUser && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-blue-800 font-medium">Admin User Creation</p>
                                            <p className="text-blue-600 text-sm">A temporary password will be automatically generated and emailed to the user. They will need to change it on first login.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Username" 
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out ${
                                            message.type === 'error' && message.text.toLowerCase().includes('username') 
                                                ? 'border-red-300 bg-red-50' 
                                                : 'border-gray-300'
                                        }`}
                                        value={userForm.username} 
                                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} 
                                        required
                                        minLength={3}
                                    />
                                    <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Username *</span>
                                </div>
                                
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out ${
                                            message.type === 'error' && message.text.toLowerCase().includes('name') 
                                                ? 'border-red-300 bg-red-50' 
                                                : 'border-gray-300'
                                        }`}
                                        value={userForm.name} 
                                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} 
                                        required
                                    />
                                    <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Full Name *</span>
                                </div>
                                
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        placeholder="your.email@gmail.com"
                                        title="Please enter a valid Gmail address"
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out ${
                                            message.type === 'error' && message.text.toLowerCase().includes('email') 
                                                ? 'border-red-300 bg-red-50' 
                                                : 'border-gray-300'
                                        }`}
                                        value={userForm.email} 
                                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} 
                                        required
                                    />
                                    <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Gmail Address *</span>
                                </div>
                                
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Phone Number" 
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                        value={userForm.phone} 
                                        onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} 
                                    />
                                    <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Phone Number</span>
                                </div>
                                
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Address" 
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                        value={userForm.address} 
                                        onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} 
                                    />
                                    <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Address</span>
                                </div>
                               
                                <div className="relative">
                                    <select 
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out appearance-none bg-white"
                                        value={userForm.role} 
                                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                        required
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="claim-manager">Claim Manager</option>
                                        <option value="client">Client</option>
                                    </select>
                                    <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Role</span>
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                {editingUser && (
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            placeholder="New Password (Leave blank to keep existing)" 
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
                                            value={userForm.password} 
                                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} 
                                        />
                                        <span className="absolute top-0 left-0 transform -translate-y-1/2 translate-x-4 bg-white px-2 text-xs text-gray-500">Password (Optional)</span>
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                className={`mt-6 w-full text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-300 font-semibold ${
                                    loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>{editingUser ? 'Updating...' : 'Creating User...'}</span>
                                    </div>
                                ) : (
                                    editingUser ? 'Update User' : 'Create User'
                                )}
                            </button>
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-lg shadow-lg">
                        <table className="w-full bg-white">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">ID</th>
                                    <th className="py-3 px-6 text-left">Username</th>
                                    <th className="py-3 px-6 text-left">Name</th>
                                    <th className="py-3 px-6 text-left">Email</th>
                                    <th className="py-3 px-6 text-left">Role</th>
                                    <th className="py-3 px-6 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {users.map(user => (
                                    <tr 
                                        key={user.id} 
                                        className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <td className="py-3 px-6">{user.id}</td>
                                        <td className="py-3 px-6">{user.username}</td>
                                        <td className="py-3 px-6">{user.name}</td>
                                        <td className="py-3 px-6">{user.email}</td>
                                        <td className="py-3 px-6">
                                            <span className={`
                                                px-3 py-1 rounded-full text-xs font-bold
                                                ${user.role === 'admin' ? 'bg-red-200 text-red-800' : 
                                                  user.role === 'client' ? 'bg-blue-200 text-blue-800' : 
                                                  user.role === 'claim-manager' ? 'bg-yellow-200 text-yellow-800' :
                                                  'bg-blue-200 text-blue-800'}
                                            `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-1"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                    <span>Edit</span>
                                                </button>
                                                <button 
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center space-x-1"
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Custom Animation */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ManageUsers;