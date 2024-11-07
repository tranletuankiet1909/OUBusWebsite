import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Select from "react-select";
import { Container, Typography, Box, Button, CircularProgress, Link } from "@mui/material";
import TextInput from "../components/TextInput";
import InputFileUpload from "../components/InputFileUpload";


const Register = () => {
    const { register, handleSubmit, control, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')
    const [avatar, setAvatar] = useState(null)
    const navigate = useNavigate()

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

    const fields = [
        { label: 'Mã số người dùng', name: 'user_code'},
        { label: 'Mật khẩu', name: 'password'},
        { label: 'Xác nhận mật khẩu', name: 'confirm'}
    ]
    const roleOptions = [
        { value: 'student', label: 'Sinh Viên'},
        { value: 'staff', label: 'Nhân Viên'}
    ]


    const onSubmit = async data => {
        setErr("");
        setLoading(true);

        if (data.password !== data.confirm) {
            setErr("Mật khẩu không khớp");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        for (let key in data) {
            if (key === 'role') {
                formData.append(key, data[key].value);
            } else if (key !== 'confirm') {
                formData.append(key, data[key])
            }
        }
        if (avatar){
            formData.append('avatar', avatar)
        }
        try {
            const response = await axios.post(`/users/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                navigate('/login/')
            } else {
                setErr('Đăng ký thất bại')
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErr(error.response.data.message || 'Mã số không tồn tại');
            } else {
                setErr('Có lỗi xảy ra, vui lòng thử lại');
            }
        } finally {
            setLoading(false);
        }
    };
    const customStyles = {
        control: (provided) => ({
            ...provided,
            height: '55px',
            minHeight: '55px',
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '55px',
            display: 'flex',
            alignItems: 'center',
        }),
    };
    return (
        <Container maxWidth='sm'>
            <Box textAlign='center' marginTop={10}>
                <Typography variant="h4" color="#02053a" fontWeight="bold">OU BUS</Typography>
                <Typography variant="h5" color="#02053a" fontWeight="bold">ĐĂNG KÝ TÀI KHOẢN </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                {fields.map(field => (
                    <div key={field.name}>
                        <TextInput 
                            label={field.label}
                            type={field.name.includes("password") || field.name.includes("confirm")  ? "password" : "text"}
                            {...register(field.name, { required: `Vui lòng nhập ${field.label}`})}
                        />
                        {errors[field.name] && <p style={{ color: 'red' }}>{errors[field.name].message}</p>}
                    </div>
                    
                ))}
                <div style={{ marginTop: 15}}>
                    <Controller
                        control={control}
                        name="role"
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={roleOptions}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={customStyles}
                            />
                        )}
                    />
                </div>

                <div style={{ marginTop: 20}}>
                    <label style={{ fontWeight: 'bold'}}>Chọn ảnh đại diện</label>
                    <div><InputFileUpload onFileSelect={setAvatar} /></div>
                    {avatar && <img src={URL.createObjectURL(avatar)} alt='avatar' style={{ width: '200px', height: 'auto', marginTop: '10px' }} />}
                </div>


                {err && <p style={{ color: 'red', fontWeight: 'bold'}}>{err}</p>}
                <Box mt={4} textAlign="center">
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Đăng ký"}
                    </Button>
                </Box>

                <Box mt={2} textAlign="center">
                <Link href="/login/" variant="body2">
                    Đã có tài khoản rồi ? Đăng nhập tại đây
                </Link>
            </Box>
            </form>
        </Container>
    );
};

export default Register;