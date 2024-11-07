import React, { useContext } from 'react';
import { Avatar, IconButton, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import './Header.css';
import Contexts from '../configs/Contexts';

const Header = ({ title }) => {
    const [userState, dispatch] = useContext(Contexts);
    return (
        <header className="app-header">
            <Typography variant="h6">{title}</Typography>
            <div className="header-actions">
                <IconButton color="inherit">
                    <NotificationsIcon />
                </IconButton>
                <IconButton color="inherit">
                    <Avatar
                            alt="Avatar"
                            src={userState.user?.user.avatar}
                            sx={{ width: 30, height: 30, margin: 'auto' }}
                    />                
                </IconButton>
            </div>
        </header>
    );
};

export default Header;
