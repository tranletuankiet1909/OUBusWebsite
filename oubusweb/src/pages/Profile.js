import { useContext, useState, useEffect } from "react";
import { Box, Typography, Table, TableRow, TableCell, Button, Avatar, Grid2, CircularProgress } from '@mui/material';
import Contexts from "../configs/Contexts";
import axios from "axios";

const Profile = () => {
    const [userState, setUserState] = useContext(Contexts);
    const [isEditable, setIsEditable] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(userState.user?.user.avatar);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('access-token');
                const response = await axios.get('/users/user-profile/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                setUserState(prevState => ({
                    ...prevState,
                    user: response.data, 
                }));

                setAvatarPreview(response.data.user.avatar);
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
            }
        };

        fetchUserData();
    }, [setUserState]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />  {/* Component loading */}
            </Box>
        );
    }

    const handleEditOn = () => {
        setIsEditable(true);
    };
    const handleEditOff = () => {
        setIsEditable(false);
    };
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatarPreview(URL.createObjectURL(file)); 
        setSelectedFile(file);
    };

    const handleSubmitAvatar = async () => {
        handleEditOff()
        if (!selectedFile) {
            alert("Vui lòng chọn một avatar để cập nhật.");
            return;
        }

        const formData = new FormData();
        formData.append('avatar', selectedFile?selectedFile:avatarPreview);

        try {
            const token = localStorage.getItem('access-token');
            const response = await axios.patch('/users/user-profile/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.info(response.data)
            if (response.status === 200) {
                alert("Avatar cập nhật thành công!");
                setUserState(prevState => ({
                    ...prevState,
                    user: {
                        ...prevState.user,
                        user: {
                            ...prevState.user.user,
                            avatar: response.data.user.avatar,
                        },
                    },
                }));
                setAvatarPreview(response.data.user.avatar)
            } else {
                alert('Cập nhật không thành công. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Đã xảy ra lỗi trong quá trình cập nhật.');
        }
    };

    const userData = userState.user?.user.role === 'student' 
        ? [
            { label: 'MSSV', value: userState.user?.student_code },
            { label: 'Họ và tên', value: userState.user?.fullname },
            { label: 'Email', value: userState.user?.email },
            { label: 'Ngày sinh', value: userState.user?.birth },
            { label: 'Khóa học', value: userState.user?.year },
            { label: 'Chuyên ngành', value: userState.user?.major },
        ] 
        : [
            { label: 'MSNV', value: userState.user?.staff_code },
            { label: 'Họ và tên', value: userState.user?.fullname },
            { label: 'Chức vụ', value: userState.user?.position },
        ];

    return (
        <Box mt={5} display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h4" mt={2} mb={4}>
                {userState.user?.user.role === 'student' ? "Thông tin sinh viên" : "Thông tin nhân viên"}
            </Typography>

            <Grid2 container spacing={3} alignItems="center" >
                {/* Bên trái: Avatar và nút thay đổi avatar */}
                <Grid2 xs={12} md={6} style={{ textAlign: 'center' }}>
                    <Avatar
                        alt="Avatar"
                        src={avatarPreview || userState.user?.user.avatar}
                        sx={{ width: 200, height: 200, margin: 'auto' }}
                    />
                    <Box mt={2}>
                        <Button variant="contained" component="label" onClick={handleEditOn}>
                            Thay đổi avatar
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={handleAvatarChange}
                            />
                        </Button>
                    </Box>
                    {isEditable && 
                        <Box mt={2}>
                            <Button
                                variant="contained"
                                onClick={handleSubmitAvatar}
                                style={{ color:'#02053a', backgroundColor: 'white' }}
                            >
                                Lưu avatar
                            </Button>
                        </Box> 
                    }
                </Grid2>

                <Grid2 xs={12} md={6}>
                    <Table style={{ marginTop: 10, width: '100%' }}>
                        {userData.map((item, index) => (
                            <TableRow key={index} className='row-style'>
                                <TableCell variant="head" style={{ fontWeight: 'bold', fontSize: 16 }}>{item.label}</TableCell>
                                <TableCell>{item.value}</TableCell>
                            </TableRow>
                        ))}
                    </Table>
                </Grid2>
            </Grid2>
        </Box>
    );
};

export default Profile;
