import { Container, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Typography, CircularProgress, Box, Button } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import axios from 'axios';
import Contexts from "../configs/Contexts";
import { useNavigate } from "react-router-dom";

const BusList = () => {
    const [userState, dispatch] = useContext(Contexts);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access-token');
    const navigate = useNavigate();
    useEffect(() => {
        fetchBuses();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    const fetchBuses = async () => {
        try {
            const response = await axios.get('/buses/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setBuses(response.data);
        } catch (error) {
            console.error('Lỗi hiển thị danh sách xe:', error);
            setError('Có lỗi xảy ra khi tải dữ liệu.'); // Set error message
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };    
    
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }
    return (
        <Box style={{ margin: 10, marginTop: 30}}>      
            <Typography variant='h4' fontWeight={'bold'} textAlign={'center'} style={{ marginBottom: 10}}> DANH SÁCH XE </Typography>
            {userState.user.user.role === 'staff' &&
                <Box style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
                    <Button onClick={() => navigate('/add-bus/')} style={{ backgroundColor:'green', color:'white', marginTop:5, marginBottom:15, right:0 }}> 
                    <Typography variant='h6'>Thêm xe bus</Typography> 
                </Button>
            </Box>       
            }
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Mã tuyến xe</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Bảng số xe</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Bến xe</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Số lượng ghế</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Trạng thái</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {buses.map((bus) => (
                            <TableRow key={bus.id} onClick={() => {navigate(`/buses/${bus.id}/`)}}>
                                <TableCell>{bus.name}</TableCell>
                                <TableCell>{bus.license_plate}</TableCell>
                                <TableCell>{bus.station.name} ({bus.station.address})</TableCell>
                                <TableCell>{bus.seat_number}</TableCell>
                                <TableCell>{bus.available ? 'Sẵn sàng' : 'Không sẵn sàng'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BusList;
