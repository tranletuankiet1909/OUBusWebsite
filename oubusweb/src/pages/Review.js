import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Rating, Typography } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';

const Review = () => {
    const { id } = useParams();
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');
    const [reviewed, setReviewed] = useState(false);
    const [reviews, setReviews] = useState([]);
    useEffect(() => {
        const checkIfReviewed = async () => {
            try {
                const token = localStorage.getItem('access-token');

                const res = await axios.get(`/tickets/${id}/reviews/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.data.length > 0) {
                    setReviewed(true);
                }
                setReviews(res.data);
            } catch (error) {
                console.error("Error checking review status", error);
            }
        };
        checkIfReviewed();
    }, [id]);
    useEffect(() => {
        handleShowReview()
    }, [id])
    const handleSubmitReview = async () => {
        if (reviewed) {
            alert("Bạn đã đánh giá vé này rồi!");
            return;
        }

        try {
            const token = localStorage.getItem('access-token');
            const formData = new FormData();
            formData.append('rating', rating);
            formData.append('content', content);
            const response = await axios.post(`/tickets/${id}/add-review/`, formData, {
                headers :  {
                    'Authorization': `Bearer ${token}`
                }
            });
            if(response.status === 201)
                alert("Đánh giá thành công!");
                setReviewed(true);
        } catch (error) {
            console.error("Error submitting review", error);
        }
    };

    const handleShowReview = async () => {
        try {
            const token = localStorage.getItem('access-token');
            // const formData = new FormData();
            // formData.append('rating', rating);
            // formData.append('content', content);
            const response = await axios.get(`/tickets/${id}/reviews/`, {
                headers :  {
                    'Authorization': `Bearer ${token}`
                }
            });
            if(response.status === 200)
                setReviews(response.data)
        } catch (error) {
            alert('Lỗi hiển thị đánh giá');
        }
    };

    return (
        <Box margin={10}>
            {!reviewed ? (
                <Box>
                    <Typography variant="h5" textAlign={'center'} fontWeight={'bold'} >ĐÁNH GIÁ CHUYẾN XE</Typography>
                    <Rating
                        value={rating}
                        onChange={(event, newValue) => setRating(newValue)}
                    />
                    <Typography variant="h6" fontWeight={'bold'} style={{ marginTop: 15, marginBottom: 5}} >Nội dung đánh giá</Typography>
                    <TextField
                        label="Nội dung đánh giá"
                        multiline
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        fullWidth
                    />
                    <Button variant="contained" color="primary" style={{ marginTop: 15}} onClick={handleSubmitReview}>
                        Gửi đánh giá
                    </Button>
                </Box>
            ) : (
                <Box mt={4}>
                    <Box>
                        {reviews.map((review) => (
                        !review.parent ? (
                            <Box>
                                <Typography variant="h6" fontWeight={'bold'}>Đánh giá của bạn</Typography>
                                <Box key={review.id} mb={2} p={2} border="1px solid #ccc" borderRadius="8px">
                                    <Typography>
                                        <strong>{review.user.username} - {review.ticket.student.fullname}</strong> (                            
                                        <Rating 
                                            name="read-only" 
                                            value={review.rating} 
                                            readOnly 
                                            precision={0.5}
                                            sx={{ color: 'gold' }} 
                                        />)
                                    </Typography>
                                    <Typography>{review.content}</Typography>
                                </Box>
                            </Box>  
                        ) : (
                            <>
                                <Typography variant="h6" fontWeight={'bold'}>Phản hồi từ Nhân viên</Typography>
                                <Box key={review.id} mb={2} p={2} border="1px solid #ccc" borderRadius="8px">
                                    <Typography fontWeight={'bold'}>Nhân Viên</Typography>
                                    <Typography>{review.content}</Typography>
                                </Box>
                            </>
                            
                        )
                        ))}
                    </Box>        
                </Box>
            )}
        </Box>
    );
};

export default Review;
