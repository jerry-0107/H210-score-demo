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

export function Profile({ data, user, handleError }) {
  const [oldPassword, setOldPassword] = React.useState()
  const [newPassword, setNewPassword] = React.useState()
  const [confirmNewPassword, setConfirmNewPassword] = React.useState()


  function UrlParam(name) {
    var url = new URL(window.location.href),
      result = url.searchParams.get(name);
    return result
  }


  function resetPassword() {
    if (newPassword !== confirmNewPassword) {
      alert("確認密碼不符，請重新輸入")
    } else {
      if (newPassword == "" || confirmNewPassword == "" || !newPassword) {
        alert("新密碼請勿空白!!")
      } else {
        fetch("/api/changepass", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userid: data.data.userid,
            oldpass: oldPassword,
            newpass: newPassword,
          })
        })
          .then(res => res.json())
          .then(res => {
            if (res.ok) {
              alert("更改密碼成功，請用新密碼重新登入")
              setOldPassword("")
              setNewPassword("")
              setConfirmNewPassword("")
              window.location.href = "/"
            }
            else {
              if (res.code == 403) {
                handleError([true, 500])
                alert("發生錯誤，請刷新網站!!")
              } else if (res.code == 404) {
                alert("原本密碼錯誤\n請重新登入")
                window.location.reload()
              }

            }

          })
          .catch(() => {
            alert("更新密碼失敗")
          })
      }

    }
  }


  return (
    <>


      <TopBar needCheckLogin={true} loggedIn={true} data={data.data} user={user} title={"個人資料"} />

      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 2 }}>
          <div>
            <h2>
              {data.data.username}<br />
              {data.data.userid}
              <br />
              {
                data.data.role === "std" ?
                  <Chip label="學生" color="primary" />
                  :
                  data.data.role === "par" ?
                    <Chip label="家長" color="secondary" />
                    :
                    <Chip label="老師" color="success" />
              }</h2>

          </div>
        </Paper>
        <p></p>
        <Paper sx={{ p: 2 }}>
          <h2>變更密碼</h2>
          <Alert severity='warning' >
            <AlertTitle>請注意</AlertTitle>
            請妥善保管新密碼，如果忘記密碼，{data.data.role !== "teacher" ? "需要請老師協助重設密碼" : "就無法再使用此系統"}
          </Alert>
          <TextField type='password' label="輸入原本密碼" helperText="輸入錯誤將被強制登出" variant="standard" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          <p></p>
          <TextField type='password' label="輸入新密碼" variant="standard" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <br />
          <TextField type='password' label="再次輸入新密碼" variant="standard" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
          <p></p>
          <Button variant='contained' onClick={resetPassword}>送出</Button>
        </Paper>

      </Box>
    </>
  )
}