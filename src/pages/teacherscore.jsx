import * as React from 'react'
import TopBar from '../Topbar'
import { Box, Button } from '@mui/material';
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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';


export function TeacherScore({ data, user, handleError }) {
  const [students, setStudents] = React.useState([
    { username: "" }
  ])


  const [scoreData, setScoreData] = React.useState([
    { id: 1, [UrlParam("q")]: "null" }
  ])
  const [tbody, setTbody] = React.useState(<>Loading</>)


  const [dialogSubmitBtnText, setDialogSubmitBtnText] = React.useState(<>更新</>)

  const [scoreSetting, setScoreSetting] = React.useState({ subject: "", scoreName: "", summery: "", })

  const [newScore, setNewScore] = React.useState()
  const [newPrivateMsg, setNewPrivateMsg] = React.useState()

  const [newTitle, setNewTitle] = React.useState()
  const [newAnnousment, setNewAnnousment] = React.useState()
  const [newTags, setNewTags] = React.useState()
  const [dialogSubmitBtnText2, setDialogSubmitBtnText2] = React.useState(<>更新</>)

  function UrlParam(name) {
    var url = new URL(window.location.href),
      result = url.searchParams.get(name);
    return result
  }


  const [open, setOpen] = React.useState(false);
  const [openingId, setOpeningId] = React.useState(
    {
      "scoreData": {
        "id": 1,
        "stdId": "s111253",
        [UrlParam("q")]: "0%|%null"
      },
      "userData": {
        "id": 1,
        "username": "",
        "userid": "",
      }
    }
  )

  const [open2, setOpen2] = React.useState(false);
  const [openingId2, setOpeningId2] = React.useState(
    {
      id: UrlParam("q"),
      title: "",
      annousment: "",
      tag: ""
    }
  )

  const [open3, setOpen3] = React.useState(false);

  const handleClickOpen = (n) => {

    setOpen(true);
    setOpeningId(n)
    //////////////////////
    setNewScore(n.scoreData[UrlParam("q")].split("%|%")[0])
    setNewPrivateMsg(n.scoreData[UrlParam("q")].split("%|%")[1] !== 'null' && n.scoreData[UrlParam("q")].split("%|%")[1] !== "" ? n.scoreData[UrlParam("q")].split("%|%")[1] : "")
  };

  const handleClickOpen2 = (n) => {

    setOpen2(true);
    setOpeningId2(n)
    //////////////////////


    setNewTitle(scoreSetting.scoreName)
    setNewAnnousment(scoreSetting.summery !== "undefined" && scoreSetting.summery ? scoreSetting.summery : "")
    setNewTags(scoreSetting.subject.split(","))
  };

  const handleClose = (n) => {

    setDialogSubmitBtnText(<><CircularProgress size="1rem" /> 更新中</>)
    if (n === "update") {
      fetch('/api/updatescore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          { id: (openingId.userData.id), scoreid: UrlParam("q"), scoreData: (newScore ? newScore : null) + "%|%" + (newPrivateMsg == "" ? null : newPrivateMsg) }),
      })
        .then(res => res.json())
        .then(
          (res) => {
            if (res.ok) {
              setDialogSubmitBtnText("更新完畢")
              setOpen(false)
              getAllStdScore()

              setDialogSubmitBtnText("更新")
            } else {
              getAllStdScore()

              setDialogSubmitBtnText("更新失敗，請重試")
            }


          }
        ).catch((e) => {
          getAllStdScore()

          getAllStdScore()
          setDialogSubmitBtnText("更新失敗，請重試")
        })

    } else {
      setOpen(false)
      setDialogSubmitBtnText("更新")
    }
  };

  const handleClose2 = (n) => {

    setDialogSubmitBtnText2(<><CircularProgress size="1rem" /> 更新中</>)
    if (n === "update") {
      fetch('/api/updatescoresetting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            scoreid: UrlParam("q"),
            title: newTitle,
            tags: newTags,
            annousment: newAnnousment

          }),
      })
        .then(res => res.json())
        .then(
          (res) => {
            if (res.ok) {
              setDialogSubmitBtnText2("更新完畢")
              setOpen2(false)
              getAllStdScore()
              setDialogSubmitBtnText2("更新")
            } else {
              getAllStdScore()
              setDialogSubmitBtnText2("更新失敗，請重試")
            }

          }
        ).catch((e) => {
          getAllStdScore()
          setDialogSubmitBtnText2("更新失敗，請重試")
        })

    } else {
      setOpen2(false)
      setDialogSubmitBtnText2("更新")
    }
  };

  function deleteScore() {
    if (window.confirm("確定要刪除這筆成績嗎?\n這項操作無法復原!!")) {
      fetch('/api/deletescore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            scoreid: UrlParam("q"),
          }),
      }).then(res => res.json())
        .then((res) => {
          if (res.ok) {
            alert("成績已經刪除")
            window.location.href = "/"
          } else {
            window.alert("成績刪除失敗")
          }

        })
        .catch(() => {
          window.alert("成績刪除失敗")
        })
    }
  }


  function getAllStdScore() {
    fetch("/api/getallstudentscorebyid", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: UrlParam("q")
      }),
    })
      .then(res => res.json())
      .then(res => {
        if (res.ok) {

          setScoreData(res.data.result)
          fetch("/api/getallstudentsforscore", {
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
                    list.push(object)

                  }
                }

                setStudents(list)
              } else {
                handleError([true, 700])
                alert("發生錯誤，請刷新網站!!")
              }
            })
        } else {
          handleError([true, 700])
          alert("發生錯誤，請刷新網站!!")
        }


      })

    fetch("/api/getscoremap", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: UrlParam("q") }),
    })
      .then(res => res.json())
      .then(res => {
        if (res.ok) {

          var list = [], k = false
          for (let i = 0; i < res.data.result.length; i++) {
            list.push(res.data.result[i].uid)

            if (res.data.result[i].uid == UrlParam("q")) {
              k = true
              setScoreSetting(res.data.result[i])

            }
          }
          if (!k) alert("找不到成績")
        } else {
          handleError([true, 700])
          alert("發生錯誤，請刷新網站!!")
        }

      })
  }

  React.useEffect(() => {
    getAllStdScore()
  }, [])

  React.useEffect(() => {
    try {
      if (students.length > 1 && scoreData.length > 1 && students.length == scoreData.length) {
        setTbody(
          <>
            <TableBody>
              {scoreData.map((row, i) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{students[i].username}</TableCell>
                  <TableCell>{row[UrlParam("q")].split("%|%")[0] == "null" || row[UrlParam("q")].split("%|%")[0] == "undefined" ? "缺考" : row[UrlParam("q")].split("%|%")[0]}</TableCell>
                  <TableCell>{row[UrlParam("q")].split("%|%")[1] == "null" || row[UrlParam("q")].split("%|%")[1] == "undefined" ? "(無資料)" : row[UrlParam("q")].split("%|%")[1]}</TableCell>
                  <TableCell><Button variant="contained" onClick={() => handleClickOpen({ scoreData: row, userData: students[i] })}>編輯</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        )
      }
    } catch (e) {
      console.warn(e)
      setTbody(<>讀取成績資料時發生錯誤，請重新整理。<br />如果是系統產生的測試資料，可以直接刪除</>)

    }

  }, [students, scoreData])



  return (
    <>

      <TopBar needCheckLogin={true} loggedIn={true} data={data.data} user={user} title={"成績資料"} />
      <Box sx={{ p: 3 }}>


        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              成績基本資料
            </Typography>
            <Typography variant="h5" component="div">
              {scoreSetting.scoreName}
            </Typography>
            <Typography variant="body2">
              <p>{scoreSetting.summery !== "undefined" && scoreSetting.summery ? scoreSetting.summery : "(沒有對全班的公告)"}</p>
              <p>學生與家長的查詢連結:<br />
                <Button onClick={() => setOpen3(true)}>選擇並複製</Button>
              </p>
              <span>成績id: {UrlParam("q")}</span>
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={handleClickOpen2}>更新基本資料</Button>
          </CardActions>
        </Card>

        <p></p>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>

                <TableCell>座號</TableCell>
                <TableCell>姓名</TableCell>
                <TableCell>成績</TableCell>
                <TableCell>私人留言</TableCell>
                <TableCell>動作</TableCell>
              </TableRow>
            </TableHead>
            {tbody}
          </Table>
        </TableContainer>
        <p></p>
        <Button onClick={() => window.location.reload()}>重新整理</Button>
        &nbsp;
        <Button color='error' variant='contained' onClick={() => deleteScore()}>刪除成績</Button>
      </Box>


      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"更新 " + openingId.userData.username + " 的成績資料"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            目前成績:{openingId.scoreData[UrlParam("q")].split("%|%")[0] && openingId.scoreData[UrlParam("q")].split("%|%")[0] !== 'null' ? openingId.scoreData[UrlParam("q")].split("%|%")[0] : "缺考"}<br />
            <p></p>
            <TextField type='number' variant="standard" label="輸入新成績" value={newScore} onInput={(e) => setNewScore(e.target.value)} />
            <p></p>
            <TextField type='text' variant="standard" label="輸入新留言" value={newPrivateMsg} onInput={(e) => setNewPrivateMsg(e.target.value)} />

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={() => handleClose("update")}>
            {dialogSubmitBtnText}
          </Button>
        </DialogActions>
      </Dialog>





      <Dialog
        open={open2}
        onClose={handleClose2}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title2">
          {"更新標題與公告"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description2">

            <TextField type='text' variant="standard" label="輸入新標題" value={newTitle} onInput={(e) => setNewTitle(e.target.value)} />
            <p></p>
            <TextField
              multiline
              rows={2}
              type='text' variant="standard" label="輸入新公告" value={newAnnousment} onInput={(e) => setNewAnnousment(e.target.value)} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose2}>取消</Button>
          <Button onClick={() => handleClose2("update")}>
            {dialogSubmitBtnText2}
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={open3}
        onClose={() => setOpen3(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title2">
          {"成績查詢連結"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description2">
            <p>從下方選擇資訊並複製</p>
            <p>以下是學生與家長專用的查詢連結:<br />
              <TextField type='text'
                InputProps={{
                  readOnly: true,
                }} sx={{ width: "100%" }} variant="standard" value={`https://h210-score-production.up.railway.app/score/?q=${UrlParam("q")}`} />
            </p>
            <p>以下是自動生成的描述:<br />
              <TextField
                multiline
                rows={6}
                InputProps={{
                  readOnly: true,
                }}
                type='text' sx={{ width: "100%" }} variant="standard" value={`各位家長好，${scoreSetting.scoreName} 的成績已經開放查詢，網址如下:\nhttps://h210-score-production.up.railway.app/score/?q=${UrlParam("q")}\n帳號是P加孩子的學號，預設密碼是孩子的學號\n*查詢時如遇系統壅塞，請耐心等候*`} />
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen3(false)}>關閉</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
