import { Container, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Typography, CircularProgress, Box, Button } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import axios from 'axios';
import Contexts from "../configs/Contexts";
import { useNavigate } from "react-router-dom";

const RouteList = () => {
    const [userState, dispatch] = useContext(Contexts);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access-token');
    const navigate = useNavigate();
    useEffect(() => {
        fetchRoutes();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await axios.get('/routes/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setRoutes(response.data);
        } catch (error) {
            console.error('Lỗi hiển thị tuyến xe:', error);
            setError('Có lỗi xảy ra khi tải dữ liệu.'); // Set error message
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };    
    
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />  {/* Component loading */}
            </Box>
        );
    }
    return (
        <Box style={{ margin: 10, marginTop: 30}}>      
            <Typography variant='h4' fontWeight={'bold'} textAlign={'center'} style={{ marginBottom: 10}}> DANH SÁCH TUYẾN XE </Typography>
            {userState.user.user.role === 'staff' &&
                <Box style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
                    <Button onClick={() => navigate('/add-route/')} style={{ backgroundColor:'green', color:'white', marginTop:5, marginBottom:15, right:0 }}> 
                    <Typography variant='h6'>Thêm tuyến xe</Typography> 
                </Button>
            </Box>       
            }
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Mã tuyến xe</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Điểm khởi hành</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Điểm kết thúc</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {routes.map((route) => (
                            <TableRow key={route.id} onClick={() => {navigate(`/routes/${route.id}/`)}}>
                                <TableCell>{route.route_code}</TableCell>
                                <TableCell>{route.starting_point.name}</TableCell>
                                <TableCell>{route.ending_point.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RouteList;
