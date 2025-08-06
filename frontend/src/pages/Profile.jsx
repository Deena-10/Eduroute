import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const Profile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await axiosInstance.get('/user/profile');
            setProfile(res.data);
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

    const handleUpdate = async () => {
        await axiosInstance.put('/user/profile', profile);
        alert('Profile updated');
    };

    if (!profile) return <p>Loading...</p>;

    return (
        <div>
            <input name="name" value={profile.name} onChange={handleChange} />
            <input name="interests" value={profile.interests.join(',')} onChange={(e) => setProfile({ ...profile, interests: e.target.value.split(',') })} />
            <input name="strengths" value={profile.strengths.join(',')} onChange={(e) => setProfile({ ...profile, strengths: e.target.value.split(',') })} />
            <button onClick={handleUpdate}>Update</button>
        </div>
    );
};

export default Profile;
