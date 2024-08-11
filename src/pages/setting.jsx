import * as React from 'react'
import TopBar from '../Topbar'
import { Alert, AlertTitle, Box, Button, TextField } from '@mui/material';
import "../App.css"
import { red, yellow, green } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';
import FaceIcon from '@mui/icons-material/Face';
import Chip from '@mui/material/Chip';
import ThemePicker from '../themePicker';
import ToggleLabel from '../toggleLabel';

export function Setting({ data, user, handleError }) {


    return (
        <>
            <TopBar needCheckLogin={true} loggedIn={true} data={data.data} user={user} title={"系統設定"} />

            <Box sx={{ p: 3 }}>
                <Paper sx={{ p: 2 }}>
                    <h2>色彩模式</h2>
                    <p>選擇顯示色彩的樣式</p>
                    <ThemePicker />
                </Paper>

                <p></p>
                <Paper sx={{ p: 2 }}>
                    <h2>關於</h2>
                    <code>
                        成績查詢系統 v1.0
                        BY Jerry <br />
                        2024.01<br />
                        SVG Background by <Button component="a" target="_blank" href="https://bgjar.com" variant="text">BGJar</Button>
                    </code>
                </Paper>
            </Box>
        </>
    )

}