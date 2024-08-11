import * as React from 'react'
import TopBar from '../Topbar'
import { Box, Button, Alert, Typography } from '@mui/material';
import "../App.css"
import { red, yellow, green } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';
import { InputForm } from '../inputBoxs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import SelectSubject from '../selectSubject';


export function PushNewScore({ data, user, handleError }) {

  const [inputValues, setInputValues] = React.useState(Array(47));
  const [summeryValue, setSummeryValue] = React.useState(Array(47));

  const [gradeTitle, setGradeTitle] = React.useState()
  const [gradeSubject, setGradeSubject] = React.useState()
  const [annousment, setAnnousment] = React.useState()


  const [students, setStudents] = React.useState([])
  const [open, setOpen] = React.useState(false);

  const [loading, setLoading] = React.useState(true);

  const [connectionStatus, setConnectionStatus] = React.useState({ status: false, message: "準備測試", finished: false })

  function handleClose() {
    setOpen(false)
  }


  const [open2, setOpen2] = React.useState(false);

  function handleClose2(t) {
    setOpen2(false)

    if (t) {
      var localData = localScore("get")
      setAnnousment(localData.annousment ? localData.annousment : "")
      //  setGradeSubject(localData.gradeSubject)
      setGradeTitle(localData.gradeTitle)
      setInputValues(localData.inputValues)
      setSummeryValue(localData.summeryValue)
    }
  }



  function localScore(type) {
    if (type === "get") {
      try {
        return JSON.parse(localStorage.getItem("localScore"))

      } catch (e) {
        return undefined
      }
    }
    else if (type === "put") {

      localStorage.setItem("localScore", JSON.stringify(
        { gradeTitle, gradeSubject, annousment, inputValues, summeryValue }
      ))

      return true
    }
    else if (type === "delete") {
      localStorage.setItem("localScore", "null")
    }
  }

  function handleChange(input, value) {
    if (input === "gradeTitle") {
      setGradeTitle(value)
    }
    else if (input === "gradeSubject") {
      setGradeSubject(value)
    }
    else if (input === "annousment") {
      setAnnousment(value)
    }
    localScore("put")
  }

  const handleGradeChange = (index, newValue) => {
    const newGrades = inputValues;
    newGrades[index] = newValue;
    setInputValues(newGrades);
    localScore("put")
  };
  const handleSummeryChange = (index, newValue) => {
    const newSummery = summeryValue;
    newSummery[index] = newValue;
    setSummeryValue(newSummery);
    localScore("put")
  };
  const handleSubmit = (m) => {
    if (!connectionStatus.status) {
      alert("伺服器連線測試失敗\n仍然要送出成績嗎?")
    }
    setOpen(true)


    fetch("/api/uploadnewscore", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: m,
        score: {
          title: gradeTitle,
          subject: gradeSubject ? gradeSubject.join(",") : "小考",
          annousment: annousment,
          scoreData: inputValues,
          summeryData: summeryValue,
        }

      }),
    })
      .then(res => res.json())
      .then(res => {
        if (res.ok) {
          localScore("delete")
          setOpen(false)
          window.location.href = `/score/class/?q=${res.uuid}`

        }
        else {
          handleError([true, 700])
          alert("發生錯誤，請刷新網站!!")
        }

      })
      .catch(() => {
        handleError([true, 500])
        alert("發生錯誤")
      })



  };



  React.useEffect(() => {
    const testconnect = async () => {

      setConnectionStatus({ status: false, message: "連線中...", finished: false })

      //測試連線與寫入
      fetch("/api/uploadnewscore", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: window.location.pathname + window.location.search,
          method: "publish",
          score: {
            title: "測試用資料",
            subject: gradeSubject ? gradeSubject.join(",") : "測試",
            annousment: annousment,
            scoreData: inputValues,
            summeryData: summeryValue,
          }
        })
      }).then(res => res.json())
        .then(res => {

          setConnectionStatus({ status: res.ok, message: !res.ok ? res.message : "測試成功，正在移除測試資料...", finished: false })

          fetch('/api/deletescore', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              {
                scoreid: res.uuid,
              }),
          }).then(res2 => res2.json())
            .then((res2) => {
              if (res.ok && res2.ok) {
                setConnectionStatus({ status: res.ok, message: res.message, finished: true })

              } else {

                window.alert("伺服器連線測試失敗!\n請重新載入，再試一次")
              }

            })
            .catch(() => {
              window.alert("伺服器連線測試失敗!\n請重新載入，再試一次")
            })
        })


      await fetch("/api/getallstudents", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },

      })
        .then(res => res.json())
        .then(res => {
          if (res.ok) {
            var list = []
            for (let i = 0; i < res.data.result.length; i++) {
              if (res.data.result[i].userid.includes("s")) {
                var object = res.data.result[i]
                object.scoreInput = <TextField type='number' inputProps={{ pattern: "[0-9]*", inputmode: "numeric" }} min="0" max="100" value={inputValues[i]} onChange={(e) => handleGradeChange(i, e.target.value)} label="輸入成績" variant="standard" />
                object.summeryInput = <TextField value={summeryValue[i]} onChange={(e) => handleSummeryChange(i, e.target.value)} label="輸入備註" variant="standard" />
                list.push(object)
              }
            }
            setStudents(list)

            // if (localScore("get") !== null) {
            //   setOpen2(true)
            // }

          } else {
            handleError([true, 500])
            alert("發生錯誤，請刷新網站!!")
          }

        })
    }
    testconnect()
  }, [])


  return (
    <>



      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: "column", textAlign: "center" }}
        open={loading}
      >
        <h1>連線測試</h1>
        <p>正在測試與伺服器的連線是否正常，<br />測試成功即可輸入新成績<br />以下是目前測試的進度:</p>
        <Paper sx={{ p: 1 }}>{connectionStatus.status ? <Typography color={green[400]} >連線成功</Typography> : connectionStatus.finished ? <Typography color={red[500]}>連線異常</Typography> : <Typography>正在測試</Typography>}{connectionStatus.message}</Paper>
        <p></p>
        <Button variant='contained' color="primary" disabled={!connectionStatus.finished} onClick={() => setLoading(false)}>{connectionStatus.status ? "繼續" : !connectionStatus.finished ? "請等待測試完成" : "測試失敗，請刷新網頁"}</Button>
      </Backdrop>




      <TopBar needCheckLogin={true} loggedIn={true} data={data.data} user={user} title={"新增成績"} />
      <div>
        <Box sx={{ p: 3 }}>
          <h1>輸入新的成績資料</h1>
          <p>
            輸入每位同學的成績<br />
            若該學生缺考，請將成績欄位留空即可
          </p>
          <TextField label="成績標題" variant="standard"
            value={gradeTitle}
            sx={{ width: "100%" }}
            onInput={(e) => handleChange("gradeTitle", e.target.value)}

          />
          <p></p>
          <TextField
            label="對全班的公告"
            multiline
            sx={{ width: "100%" }}
            rows={2}
            variant="standard"
            value={annousment}
            onInput={(e) => setAnnousment(e.target.value)}

          />
          <p></p>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>座號</TableCell>
                  <TableCell>姓名</TableCell>
                  <TableCell>成績</TableCell>
                  <TableCell>私人留言(僅該學生與家長可查看)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((row, i) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.scoreInput}</TableCell>
                    <TableCell>{row.summeryInput}</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <p>{connectionStatus.status ? <Typography color={green[400]}>連線成功</Typography> : <Typography color={red[500]}>連線異常</Typography>} {connectionStatus.message}</p>

          <Button variant='contained' onClick={() => handleSubmit("save")}>送出</Button>

        </Box>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"正在寫入資料"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            正在將 {gradeTitle} 的資料寫入資料庫，請稍候...<br />
            完成後，頁面將自動重整
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
        </DialogActions>
      </Dialog>





      <Dialog
        open={open2}
        onClose={() => handleClose2(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"是否要復原未送出的資料?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            上次編輯的成績 {localScore("get") == null ? "" : localScore("get").gradeTitle}有未送出的資料，是否要復原這些資料，繼續編輯?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose2(false)}>取消</Button>
          <Button onClick={() => handleClose2(true)} variant="contained">確定</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}