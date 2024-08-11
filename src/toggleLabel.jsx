import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default function ToggleLabel({ user }) {
    const [radioVal, setRadioVal] = React.useState()
    const handleValChange = (e) => {
        setRadioVal(e.target.value)
        localStorage.setItem("scorelabel", e.target.value)
    }
    return (
        <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">選擇標籤要顯示的資訊</FormLabel>
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="不顯示標籤"
                name="radio-buttons-group"
                value={radioVal}
                onChange={handleValChange}
            >
                <FormControlLabel value="不顯示標籤" control={<Radio />} label="不顯示標籤" />
                <FormControlLabel value="我的分數/名次" control={<Radio />} label={`${user.role == "std" ? "我" : "孩子"}的分數/名次`} />
                <FormControlLabel value="最高分數" control={<Radio />} label="最高分數" />
                <FormControlLabel value="最低分數" control={<Radio />} label="最低分數" />
                <FormControlLabel value="平均分數" control={<Radio />} label="平均分數" />
                {user.role == "std" ?
                    <>
                        <FormControlLabel value="家長查詢次數" control={<Radio />} label="家長查詢次數 [學生專屬]" />

                    </> : <></>}
            </RadioGroup>
        </FormControl>
    );
}