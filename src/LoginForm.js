import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import { Alert, Paper, Typography, CircularProgress } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useRef } from 'react';
import "../src/app.css"
import ReCAPTCHA from "react-google-recaptcha";
import useMediaQuery from '@mui/material/useMediaQuery';
import dayjs from 'dayjs';

import LinearProgress from '@mui/material/LinearProgress';
function LoginForm({ set, callback }) {
  const [userid, setuserid] = useState(localStorage.getItem("loggedInUserid") ? localStorage.getItem("loggedInUserid") : "");
  const [password, setPassword] = useState('');
  const [showDialog, setShowDialog] = useState(false)
  const [showDialog2, setShowDialog2] = useState(false)
  const [recaptchaLoading, setRecaptchaLoading] = React.useState(true);

  const [loginType, setLoginType] = React.useState("password")

  const [recaptcha, setRecaptcha] = useState("")
  const [serverAnnouncement, setServerAnnouncement] = React.useState(
    { title: "連線中...", body: "正在連線到伺服器...", type: "info", updateTime: "now", action: "ok" }
  )
  const submitButttonRef = useRef()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [isLogining, setIsLogining] = React.useState(false)

  const theme = (
    localStorage.getItem("theme") == "light" ? "light" :
      localStorage.getItem("theme") == "dark" ? "dark" :
        prefersDarkMode ? "dark" : "light"
  )

  const handleLogin = async () => {
    setIsLogining(true)
    await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userid, password, recaptcha }),
    })
      .then(res => res.json())
      .then(
        (res) => {
          if (res.ok) {
            set(true)
            localStorage.setItem("loggedInUserid", userid)
            callback(res)
          } else {
            alert(res.message)
            window.location.reload()
          }
        }
      )

  };

  function recaptchaOnLoad() {
    console.log("recaptcha is loaded")
    setRecaptchaLoading(false)
  }

  function showDialogF() {
    setShowDialog(true)
  }
  React.useEffect(() => {
    document.title = "登入 - H210成績查詢系統"
    fetch(
      '/api/service/annoucement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
    ).then(res => res.json())
      .then(res => {

        setServerAnnouncement(res)

        if (res.title !== "null" && res.title !== null) {
          if (res.action.includes("dialog")) {
            setShowDialog2(true)
          }
        }
      })
  }, [])

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.keyCode === 13 && submitButttonRef.current) {
        submitButttonRef.current.click()
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [submitButttonRef, userid, password])

  return (
    <>

      <Paper sx={{
        p: 2,
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        flexDirection: "column",
        flexWrap: "wrap",
        alignContent: "space-around",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        backdropFilter: " blur(5px)",
        width: "fit-content",
        height: "fit-content",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        minWidth: "20em"
      }}>
        {
          loginType == "password" ?
            <center>
              {serverAnnouncement.action == "not_allow_login" || serverAnnouncement.title == "連線中..." ?
                <>

                  <h2 style={{ margin: 0 }}>H210<br />成績查詢系統</h2>

                  <p></p>

                  <Typography variant="h4" sx={{ minWidth: "200px", }} gutterBottom>{serverAnnouncement.title}</Typography>

                  {serverAnnouncement.title == "連線中..." ? <p><LinearProgress /></p>
                    : <></>}
                  <p>{serverAnnouncement.body}</p>
                  {serverAnnouncement.action == "not_allow_login" ?
                    <p>最後更新於{serverAnnouncement.updateTime == "now" ? dayjs(new Date()).format("YYYY-MM-DD HH:mm") : serverAnnouncement.updateTime}</p>
                    : <></>}
                </> :
                <>

                  <div hidden={serverAnnouncement.title == "null" || serverAnnouncement.title == null}>
                    <Alert severity={serverAnnouncement.type ? serverAnnouncement.type : "info"}
                      action={<Button onClick={() => setShowDialog2(true)} size='small' color={serverAnnouncement.type ? serverAnnouncement.type : "info"}>更多</Button>}>
                      {serverAnnouncement.title}
                    </Alert></div>

                  <h1 style={{ margin: 0 }}>H210 </h1>
                  <h2 style={{ marginTop: 0 }}>成績查詢系統</h2>
                  <TextField type='text' value={userid} id="userid-input" label="帳號" variant="standard" onChange={(e) => setuserid(e.target.value)} />
                  <p></p>
                  <TextField type='password' value={password} onChange={(e) => setPassword(e.target.value)} id="userpassword-input" label="密碼" variant="standard" />
                  <p></p>
                  {recaptchaLoading ? <>正在載入驗證碼...</> : <></>}
                  <p></p>
                  <ReCAPTCHA
                    sitekey="6LeoWJ0oAAAAAN9LRkvYIdq3uenaZ6xENqSPLr9_"
                    onChange={e => { setRecaptcha(e) }}
                    onExpired={e => { setRecaptcha("") }}
                    theme={theme}
                    asyncScriptOnLoad={recaptchaOnLoad}
                  />
                  <p></p>
                  <Button ref={submitButttonRef} variant="contained" onClick={handleLogin}
                    disabled={recaptcha == "" || isLogining}>{isLogining ? <><CircularProgress size={"1rem"} /> 正在登入</> : "開始查詢"}</Button>
                  &nbsp;
                  <p></p>
                  {/* <Button variant="text" size='small' onClick={() => { setLoginType(loginType == "password" ? "Google" : "password") }}><SyncAltIcon /> 使用{loginType == "password" ? "Google" : "帳號密碼"}登入</Button> */}

                  <Button variant="outlined" sx={{ ml: 1, display: "none" }} onClick={() => showDialogF()}>帳密提示</Button>

                </>}

            </center> :
            <center style={{ width: "100%" }}>

              <div hidden={serverAnnouncement.title == "null" || serverAnnouncement.title == null}>
                <Alert severity={serverAnnouncement.type ? serverAnnouncement.type : "info"}
                  action={<Button onClick={() => setShowDialog2(true)} size='small' color={serverAnnouncement.type ? serverAnnouncement.type : "info"}>更多</Button>}>
                  {serverAnnouncement.title}
                </Alert></div>

              <h1 style={{ margin: 0 }}>H210</h1>
              <h2 style={{ marginTop: 0 }}>成績查詢系統</h2>
            </center>
        }

      </Paper>

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"帳密提示"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            〈學生〉<br />
            帳號為s加學號，密碼為身份證後四碼
            <p></p>
            〈家長〉
          </DialogContentText>
        </DialogContent>
        <DialogActions>

          <Button onClick={() => setShowDialog(false)} autoFocus>
            確定
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={showDialog2}
        onClose={() => setShowDialog2(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {serverAnnouncement.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>{serverAnnouncement.body}</p>
            <Typography variant="button" display="block">最後更新於{serverAnnouncement.updateTime == "now" ? dayjs(new Date()).format("YYYY-MM-DD HH:mm") : serverAnnouncement.updateTime}</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>

          <Button onClick={() => setShowDialog2(false)} autoFocus>
            確定
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default LoginForm;
