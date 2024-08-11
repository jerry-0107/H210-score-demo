import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

export function InputForm({ i }) {
    const [inputValues, setInputValues] = useState(Array(i).fill(''));

    const handleInputChange = (index, value) => {
        const updatedValues = [...inputValues];
        updatedValues[index] = value;
        setInputValues(updatedValues);
    };

    const handleSubmit = () => {
        // 在這裡處理提交操作，您可以使用inputValues數組中的值
    };

    return (
        <div>
            {inputValues.map((value, index) => (

                <TextField key={index} value={value} onChange={(e) => handleInputChange(index, e.target.value)} label="輸入成績" variant="standard" />
            ))}

        </div>
    );
}

