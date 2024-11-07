import React from 'react';
import TextField from '@mui/material/TextField';

const TextInput = React.forwardRef(({ label, value, onChange, type, icon, ...props }, ref) => {
    return (
        <TextField
            label={label}
            value={value}
            onChange={onChange}
            type={type || 'text'}
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
                endAdornment: icon,
            }}
            inputRef={ref}  
            {...props} 
        />
    );
});

export default TextInput;
