import * as React from 'react'
import TopBar from '../Topbar'
import { Box } from '@mui/material';
import "../App.css"
import { red, yellow, green } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';

export function AllScoreSheet({ data, user, handleError }) {


    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));



    return (
        <>
            <TopBar needCheckLogin={true} loggedIn={true} data={data.data} user={user} title={"成績管理"} />
            <Box sx={{ p: 3 }}>
                <h1>成績管理</h1>
                <Grid container spacing={2} >
                    <Grid xs={6} component={Link} to={"/backend/score/search"} sx={{ textDecoration: "none" }}>
                        <Item><h1>查詢成績</h1>查詢與編輯現有成績</Item>
                    </Grid>
                    <Grid xs={6} component={Link} to={"/backend/score/push"} sx={{ textDecoration: "none" }}>
                        <Item><h1>新增成績</h1>寫入新成績</Item>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}