import * as React from 'react'
import TopBar from '../Topbar'
import { Alert, AlertTitle, Box } from '@mui/material';
import "../App.css"
import { red, yellow, green } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';

export function AllAccountSheet({ data, user, handleError }) {


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
                <h1>帳號管理</h1>
                <Grid container spacing={2} >
                    <Grid xs={6} component={Link} to={"/backend/account/student"} sx={{ textDecoration: "none" }}>
                        <Item><h1>學生帳號</h1>變更學生密碼</Item>
                    </Grid>
                    <Grid xs={6} component={Link} to={"/backend/account/parent"} sx={{ textDecoration: "none" }}>
                        <Item><h1>家長帳號</h1>變更家長密碼</Item>
                    </Grid>
                </Grid>
                <p></p>
                <Alert severity="info">
                    <AlertTitle>說明</AlertTitle>
                    <p>為了區分使用者，因此設立學生帳號與家長帳號，學生帳號僅供學生使用，家長帳號僅供家長使用<br />
                        <b>請勿將學生帳號提供給家長，或將家長帳號提供給學生</b></p>
                </Alert>
            </Box>
        </>
    )
}