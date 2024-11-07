import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';  // Import Outlet để hiển thị route con
import SideMenu from './SideMenu';  
import './MainLayout.css'; 
import Header from './Header';

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [headerTitle, setHeaderTitle] = useState('Trang chủ');

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const updateHeaderTitle = (title) => {
        setHeaderTitle(title);
    };

    return (
        <div className="main-layout">
            <div className="layout-body">
                <SideMenu 
                    isCollapsed={isCollapsed} 
                    toggleCollapse={toggleCollapse} 
                    updateHeaderTitle={updateHeaderTitle} 
                />  
                <div className={`content-container ${isCollapsed ? 'collapsed' : ''}`}>
                    <div style={{ display: 'fixed' }}>
                        <Header title={headerTitle} />
                    </div>
                    
                    <div className="main-content">
                        {/* Outlet sẽ hiển thị nội dung của route con */}
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
