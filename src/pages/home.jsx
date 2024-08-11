import * as React from 'react'
import TopBar from '../Topbar'
import { Box, Button, Paper, Typography, Alert } from '@mui/material'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Link } from 'react-router-dom';
import Tabs from '../scoreList';
import ScoreTabs from '../scoreList';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { red, yellow, green, grey, blue } from '@mui/material/colors';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

export function Homepage({ user, data, handleError }) {

  const [scorelist, setScoreList] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const [scoreTab, setScoreTab] = React.useState("loading")
  React.useEffect(() => {
    getScore()
  }, [])

  function getScore() {
    setLoading(true)
    fetch("/api/connection/test", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then(res => res.json())
      .then(res => {

        if (res.ok) {
          fetch("/api/getscoremap", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          })
            .then(res2 => res2.json())
            .then(res2 => {
              setLoading(false)
              if (res2.ok) {

                var list = []
                for (let i = 0; i < res2.data.result.length; i++) {
                  list.push({ title: res2.data.result[i].scoreName, id: res2.data.result[i].uid, subject: res2.data.result[i].subject })
                }
                setScoreList(list)
              } else {
                handleError([true, 700])
                alert("發生錯誤，請刷新網站!!")

              }

            })
        } else {
          setLoading(false)
          handleError([true, 700])
          alert("發生錯誤，請刷新網站!!")
        }
      })
  }


  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    overflow: "auto",
    color: theme.palette.text.secondary,
  }));



  React.useEffect(() => {
    if (scorelist.length < 1) {
      setScoreTab(<p>沒有可查詢的資料</p>)
    } else {
      setScoreTab(<ScoreTabs data={scorelist} role={"std"} />)
    }
  }, [scorelist])

  return (
    <>
      <TopBar needCheckLogin={true} loggedIn={true} data={data.data} user={user} title={"首頁"} />
      <Box sx={{ p: 3 }}>
        {/* {data.data.role === "std" ? <><Alert
          action={
            <Button color="inherit" size="small" component={Link} to="/more">
              立即前往
            </Button>
          }
        >
          查看所有成績的家長查詢狀態
        </Alert><p></p></>
          : <></>} */}
        <Typography variant='h5'> Hi, {data.data.username}</Typography>
        <Typography variant='h6'>選擇成績，開始查詢</Typography>
        {/* {data.data.role === "std" ?
          <>
            <Item sx={{ background: blue[500], color: "#fff" }}>
              <h3>學生專屬功能</h3>
              <p>查看家長查詢狀態</p>
              <Button variant="contained" component={Link} to={`/more`} color={"primary"}>前往</Button>
            </Item>
            <p></p></>
          : <></>} */}
        {scoreTab}
        <p></p>

      </Box>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}