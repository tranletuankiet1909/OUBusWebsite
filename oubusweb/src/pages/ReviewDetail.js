import { Container, Typography, TextField, Button, Box, CircularProgress, Snackbar, Alert, Rating } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const ReviewDetail = () => {
    const { id } = useParams();
    const [review, setReview] = useState(null);
    const [reply, setReply] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('access-token');

    // Lấy chi tiết đánh giá và phản hồi từ API
    useEffect(() => {
        const fetchData = async () => {
            await fetchReviewDetail();
            await fetchReply();
        };
        fetchData();
    }, [id, token]);

    const fetchReviewDetail = async () => {
        try {
            const response = await axios.get(`/reviews/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setReview(response.data);
            setEditedContent(response.data.content); // Đặt nội dung chỉnh sửa thành nội dung đánh giá hiện tại
        } catch (error) {
            console.error('Lỗi khi tải chi tiết đánh giá:', error);
            setError('Có lỗi xảy ra khi tải chi tiết đánh giá.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReply = async () => {
        try {
            const response = await axios.get('/reviews/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const replyReview = response.data.find((r) => r.parent === parseInt(id));
            if (replyReview) {
                setReply(replyReview);
                setEditedContent(replyReview.content); // Đặt nội dung chỉnh sửa thành nội dung phản hồi hiện tại
            }
        } catch (error) {
            console.error('Lỗi khi tải phản hồi:', error);
            setError('Có lỗi xảy ra khi tải phản hồi.');
        }
    };

    const handleReplySubmit = async () => {
        try {
            await axios.post(`/tickets/${review.ticket.id}/add-review/`, {
                content: replyContent,
                parent: id,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setSuccess(true);
            setReplyContent('');
            fetchReply(); // Cập nhật lại thông tin phản hồi
        } catch (error) {
            console.error('Lỗi khi gửi phản hồi:', error);
            setError('Có lỗi xảy ra khi gửi phản hồi.');
        }
    };

    // Xử lý chỉnh sửa phản hồi
    const handleEditSubmit = async () => {
        try {
            await axios.patch(`/reviews/${reply.id}/`, {
                content: editedContent,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setSuccess(true);
            setIsEditing(false);
            fetchReply(); // Cập nhật lại thông tin phản hồi
        } catch (error) {
            console.error('Lỗi khi chỉnh sửa phản hồi:', error);
            setError('Có lỗi xảy ra khi chỉnh sửa phản hồi.');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box style={{ margin: 20 }}>
            {review ? (
                <>
                    <Typography variant="h4" gutterBottom align="center" fontWeight={'bold'}>CHI TIẾT ĐÁNH GIÁ</Typography>
                    <Box mt={2}>
                        <Typography variant="h6" fontWeight={'bold'}>Thông tin vé xe</Typography>
                        <Typography><strong>Sinh viên:</strong> {review.ticket.student.fullname}</Typography>
                        <Typography><strong>MSSV:</strong> {review.user.username}</Typography>
                        <Typography><strong>Chuyến:</strong> {review.ticket.seat_bustrip.trip.route.starting_point.name} - {review.ticket.seat_bustrip.trip.route.ending_point.name}</Typography>
                        <Typography><strong>Ngày khởi hành:</strong>{format(new Date(review.ticket.seat_bustrip.trip.start_time), 'dd/MM/yyyy HH:mm')}</Typography>
                        <Typography><strong>Biển số xe:</strong> {review.ticket.seat_bustrip.seat.bus.license_plate}</Typography>
                    </Box>

                    <Box mt={4}>
                        <Box>
                            <Typography variant="h6" fontWeight={'bold'}>Thông tin đánh giá</Typography>
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
                    </Box>

                    <Box mt={4}>
                        <Typography variant="h6" fontWeight={'bold'}>Phản hồi</Typography>
                        {reply ? (
                            <Box mt={2}>
                                {isEditing ? (
                                    <>
                                        <TextField
                                            fullWidth
                                            label="Nội dung phản hồi"
                                            multiline
                                            rows={4}
                                            value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}
                                        />
                                        <Button variant="contained" color="primary" onClick={handleEditSubmit} style={{ marginTop: '16px' }}>
                                            Lưu thay đổi
                                        </Button>
                                        <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)} style={{ marginTop: '16px', marginLeft: '16px' }}>
                                            Hủy
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Typography><strong>Nhân viên phản hồi: </strong> {reply.user.username}</Typography>
                                        <Typography><strong>Nội dung phản hồi: </strong> {reply.content}</Typography>
                                        <Button variant="outlined" color="primary" onClick={() => setIsEditing(true)} style={{ marginTop: '16px' }}>
                                            Chỉnh sửa
                                        </Button>
                                        <Button variant="outlined" color="secondary" onClick={() => navigate(`/reviews/`)} style={{ marginTop: '16px', marginLeft: 5 }}>
                                            Thoát
                                        </Button>
                                    </>
                                )}
                            </Box>
                        ) : (
                            <>
                                <TextField
                                    fullWidth
                                    label="Nhập nội dung phản hồi"
                                    multiline
                                    rows={4}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                />
                                <Button variant="contained" color="primary" onClick={handleReplySubmit} style={{ marginTop: '16px' }}>
                                    Gửi phản hồi
                                </Button>
                            </>
                        )}
                    </Box>
                </>
            ) : (
                <Typography color="error">Không tìm thấy đánh giá.</Typography>
            )}
            <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
                <Alert onClose={() => setSuccess(false)} severity="success">Thao tác thành công!</Alert>
            </Snackbar>
        </Box>
    );
};

export default ReviewDetail;
