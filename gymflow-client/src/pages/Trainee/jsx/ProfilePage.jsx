import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import apiService from '../../../api/apiService';

function ProfilePage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const data = await apiService.get('/api/trainee/profile');
                setProfileData(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch profile data.');
                console.error(err);
                setProfileData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [isAuthenticated, navigate]);

    if (isLoading) {
        return <p className="text-center text-lg">Loading profile...</p>;
    }

    if (error) {
        return <p className="text-center text-lg text-red-500">Error: {error}</p>;
    }

    if (!profileData) {
        return <p className="text-center text-lg">No profile data found.</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">My Profile</h1>
            <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4">
                <div>
                    <p className="text-xl font-medium text-black">Full Name: {profileData.fullName}</p>
                </div>
                <div>
                    <p className="text-slate-500">Email: {profileData.email}</p>
                </div>
                <div>
                    <p className="text-slate-500">Phone Number: {profileData.phoneNumber}</p>
                </div>
                <div>
                    <p className="text-slate-500">Subscription: {profileData.subscriptionStatus}</p>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;