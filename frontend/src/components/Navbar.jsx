import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav style={{ padding: '10px', background: '#f0f0f0' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
            {!user ? (
                <>
                    <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                    <Link to="/signup">Signup</Link>
                </>
            ) : (
                <>
                    <Link to="/profile" style={{ marginRight: '10px' }}>Profile</Link>
                    <button onClick={logout}>Logout</button>
                </>
            )}
        </nav>
    );
};

export default Navbar;
