import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Typography, CircularProgress, Box, Button } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import axios from 'axios';
import Contexts from "../configs/Contexts";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';

const ReviewList = () => {
    const [userState, dispatch] = useContext(Contexts);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access-token');
    const navigate = useNavigate();
    useEffect(() => {
        fetchReviews();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await axios.get('/reviews/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setReviews(response.data);
        } catch (error) {
            console.error('Lỗi hiển thị đánh giá:', error);
            setError('Có lỗi xảy ra khi tải dữ liệu.');
        } finally {
            setLoading(false);
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
            <Typography variant='h4' fontWeight={'bold'} textAlign={'center'} style={{ marginBottom: 10}}> DANH SÁCH ĐÁNH GIÁ </Typography>
            {/* {userState.user.user.role === 'staff' &&
                <Box style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
                    <Button onClick={() => navigate('/add-route/')} style={{ backgroundColor:'green', color:'white', marginTop:5, marginBottom:15, right:0 }}> 
                    <Typography variant='h6'>Thêm tuyến xe</Typography> 
                </Button>
            </Box>       
            } */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>MSSV</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Tuyến xe</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Giờ khởi hành</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Số sao</Typography></TableCell>
                            <TableCell><Typography style={{ fontWeight:'bold' }}>Ngày tạo</Typography></TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reviews.map((review) => (
                            !review.parent && ( 
                            <TableRow key={review.id} onClick={() => { navigate(`/reviews/${review.id}/`) }}>
                                <TableCell>{review.user.username}</TableCell>
                                <TableCell>{review.ticket.seat_bustrip.trip.route.starting_point.name} - {review.ticket.seat_bustrip.trip.route.ending_point.name}</TableCell>
                                <TableCell>{format(new Date(review.ticket.seat_bustrip.trip.start_time), 'dd/MM/yyyy HH:mm')}</TableCell>
                                <TableCell>{review.rating}</TableCell>
                                <TableCell>{format(new Date(review.created_date), 'dd/MM/yyyy HH:mm')}</TableCell>
                            </TableRow>
                        )
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ReviewList;
