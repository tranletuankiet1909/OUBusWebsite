import React, { useContext } from 'react';
import './SideMenu.css'; 
import { Home, Person, TextSnippet, AppRegistration, Login, Logout, Route, AirportShuttle, Comment, Equalizer, AddShoppingCart, ContactSupport, Password } from '@mui/icons-material';  // Import icons từ MUI
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Contexts from '../configs/Contexts';

const SideMenu = ({ isCollapsed, toggleCollapse, updateHeaderTitle }) => {
    const navigate = useNavigate();
    const [userState, dispatch] = useContext(Contexts);

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="logo-details">
                <IconButton
                            className="menu-toggle"
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleCollapse}
                            // disabled={!userState.user}
                        >
                        <MenuIcon style={{ color: "white" }} />
                </IconButton>
                {!isCollapsed && 
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} color='white' onClick={() => {
                        navigate('/')
                        updateHeaderTitle('Trang chủ');
                    }            
                    }>
                    OU BUS
                    </Typography>
                }

            </div>
            <ul className="nav-list">
                <li onClick={() => {
                    updateHeaderTitle('Trang chủ');
                    navigate('/');
                }}>
                    <a>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            // onClick={toggleCollapse}
                        >
                            <Home style={{ color: "white" }} />
                        </IconButton>
                        {!isCollapsed && <span> Trang chủ </span>}
                    </a>
                </li>
                {userState.user ? 
                <>
                    {userState.user.user.role === 'staff' && 
                    <>
                        <li onClick={() => {
                        updateHeaderTitle('Quản lý tuyến xe');
                        navigate('/routes/')
                        }}>
                            <a>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    sx={{ mr: 2 }}
                                >
                                    <Route style={{ color: "white" }} />
                                </IconButton>
                                {!isCollapsed && <span> Quản lý tuyến xe </span>}
                            </a>
                        </li>
                        <li  onClick={() => {
                            updateHeaderTitle('Quản lý xe');
                            navigate('/buses/')
                        }}>
                            <a>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    sx={{ mr: 2 }}
                                >
                                    <AirportShuttle style={{ color: "white" }} />
                                </IconButton>
                                {!isCollapsed && <span> Quản lý xe bus </span>}
                            </a>
                        </li>
                        <li onClick={() => {
                            updateHeaderTitle('Quản lý đánh giá');
                            navigate('/reviews/')
                        }}>
                            <a>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    sx={{ mr: 2 }}
                                    // onClick={toggleCollapse}
                                >
                                    <Comment style={{ color: "white" }} />
                                </IconButton>
                                {!isCollapsed && <span> Quản lý đánh giá </span>}
                            </a>
                        </li>
                        <li onClick={() => {
                            updateHeaderTitle('Thống kê');
                            navigate('/statistic/')
                        }}>
                            <a>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    sx={{ mr: 2 }}
                                    // onClick={toggleCollapse}
                                >
                                    <Equalizer style={{ color: "white" }} />
                                </IconButton>
                                {!isCollapsed && <span> Thống kê </span>}
                            </a>
                        </li>
                    </>
                        
                    }
                    <li onClick={() => {
                        updateHeaderTitle('Thông tin cá nhân');
                        navigate('/profile/')
                    }}>
                        <a href="#" >
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                sx={{ mr: 2 }}
                            >
                                <Person style={{ color: "white" }} />
                            </IconButton>
                            {!isCollapsed && <span> Thông tin cá nhân </span>}
                        </a>
                    </li>
                    <li onClick={() => {
                        updateHeaderTitle('Thay đổi mật khẩu');
                        navigate('/change-password/')
                    }}>
                        <a>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                sx={{ mr: 2 }}
                            >
                                <Password style={{ color: "white" }} />
                            </IconButton>
                            {!isCollapsed && <span> Thay đổi mật khẩu </span>}
                        </a>
                    </li>
                    {userState.user.user.role === 'student' && 
                    <>
                        <li onClick={() => {
                            updateHeaderTitle('Lịch sử đặt vé');
                            navigate('/tickets/');
                        }}>
                            <a>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    sx={{ mr: 2 }}
                                    // onClick={toggleCollapse}
                                >
                                    <TextSnippet style={{ color: "white" }} />
                                </IconButton>
                                {!isCollapsed && <span> Lịch sử đặt vé </span>}
                            </a>
                        </li>
                        <li onClick={() => {
                            updateHeaderTitle('Đăng ký Combo');
                            navigate('/comboes/');
                        }}>
                            <a>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    sx={{ mr: 2 }}
                                    // onClick={toggleCollapse}
                                >
                                    <AddShoppingCart style={{ color: "white" }} />
                                </IconButton>
                                {!isCollapsed && <span> Đăng ký Combo </span>}
                            </a>
                        </li>
                    </>
                        
                        
                    }
                    <li onClick={() => {
                            updateHeaderTitle('Chat');
                            navigate('/chat/');
                        }}>
                        <a>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                sx={{ mr: 2 }}
                                // onClick={toggleCollapse}
                            >
                                <ContactSupport style={{ color: "white" }} />
                            </IconButton>
                            {!isCollapsed && <span> Chat hỗ trợ </span>}
                        </a>
                    </li>
                    <li onClick={() => {
                    dispatch({
                        type: 'logout',
                    });
                    navigate('/login/');
                    }}>
                        <a>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                sx={{ mr: 2 }}
                            >
                                <Logout style={{ color: "white" }} />
                            </IconButton>
                            {!isCollapsed && <span> Đăng xuất </span>}
                        </a>
                    </li>
                </> 
                : <>
                    <li onClick={() => {
                    navigate('/login/')
                    }}>
                        <a>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                sx={{ mr: 2 }}
                            >
                                <Login style={{ color: "white" }} />
                            </IconButton>
                            {!isCollapsed && <span> Đăng nhập </span>}
                        </a>
                    </li>

                    <li onClick={() => {
                        navigate('/register/')}}>
                        <a>
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                sx={{ mr: 2 }}
                            >
                                <AppRegistration style={{ color: "white" }} />
                            </IconButton>
                            {!isCollapsed && <span> Đăng ký </span>}
                        </a>
                    </li>
                </>}
            </ul>
        </div>
    );
};

export default SideMenu;
