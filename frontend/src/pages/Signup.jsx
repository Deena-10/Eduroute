import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Signup = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axiosInstance.post('/auth/signup', form);
        alert('Signup successful! Please login.');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input name="password" placeholder="Password" type="password" onChange={handleChange} />
            <button type="submit">Signup</button>
        </form>
    );
};

export default Signup;
