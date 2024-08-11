import * as React from 'react'
import TopBar from '../Topbar'
import { Alert, Box, Button } from '@mui/material';
import "../App.css"
import { red, yellow, green } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
const { v4: uuidv4 } = require('uuid');

export function ErrorPage({ errorId, errorSummery, data, user }) {
    const [countdown, setCountdown] = React.useState(30)

    const errorIdList = [0, 403, 404, 500, 700, 1000]
    const errorDefSummery = [
        ["未偵測到錯誤", ": )"],//0
        ["沒有權限使用", "請確定你登入的帳號是否正確"],//403
        ["找不到成績", "請確定你的網址是否正確。如果這個網址是由老師提供的，請通知老師。"],//404
        ["內部伺服器錯誤", "對不起，我們正在努力修復，稍後將恢復正常"],//500
        ["暫時性錯誤", "請等待幾分鐘，然後再試一次"],//700
        ["網路錯誤", "請檢查你的網路連線，然後再試一次"],//1000
    ]


    const [randomCode, setRandomCode] = React.useState(uuidv4().slice(0, 4))
    const [reportState, setReportState] = React.useState("錯誤報告處理中...")

    const [errorTime, setErrorTime] = React.useState(dayjs().format("YYYY/MM/DD HH:mm:ss"))


    function sendReport() {
        setReportState("正在傳送錯誤報告...")
        console.log("error page", errorId)
        fetch("/api/report/pusherrorlog", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                randomCode: randomCode,
                errorCode: errorId,
                time: errorTime,
                path: window.location.pathname + window.location.search
            }),
        })
            .then(res => res.json())
            .then(res => {
                if (res.ok) {
                    setReportState("錯誤報告已經傳送")
                } else {
                    setReportState(<>錯誤報告傳送失敗<Button variant='text' onClick={() => sendReport()}>重新傳送</Button></>)
                }
            })
    }

    function delay(n) {
        return new Promise(function (resolve) {
            setTimeout(resolve, n * 1000);
        });
    }
    React.useEffect(() => {

        async function wait() {
            if (errorId == 500 || errorId >= 700 && errorId < 800) {
                setCountdown(60)

                for (let i = 0; i < 60; i++) {
                    await delay(1)
                    setCountdown((old) => old - 1)
                }

            } else {
                setCountdown(0)
            }
        }
        wait()
    }, []);




    React.useEffect(() => {
        sendReport()
    }, [])
    return (
        <>
            <TopBar needCheckLogin={false} loggedIn={true} data={data.data} user={user} title={"發生錯誤"} />
            <Box sx={{ p: 3 }}>

                <Typography variant="h2" gutterBottom>
                    : (
                </Typography>
                <h2>
                    {errorDefSummery[errorIdList.indexOf(errorId)][0]}
                </h2>
                <p>
                    {errorDefSummery[errorIdList.indexOf(errorId)][1]}
                </p>

                <p>
                    <Button sx={{ mr: 1 }} variant="contained" onClick={() => window.location.reload()} disabled={countdown > 0}>{countdown > 0 ? `可於${countdown}秒內重新整理` : "重新整理"}</Button>
                    <Button color="secondary" variant="outlined" onClick={() => window.location.href = "/"}>回首頁</Button>
                    <br />{errorId == 500 || errorId >= 700 && errorId < 800 ? <Alert sx={{ mt: 1 }} severity="error">請勿提前重新整理</Alert> : <></>}
                </p>

                <hr />
                <code>
                    錯誤代碼: {errorId}
                    <p></p>
                    詳細資料如下:
                    <pre>
                        path:{window.location.pathname}{window.location.search}<br />
                        user:{data.data.userid}<br />
                        time:{errorTime}<br />
                        uuid:{randomCode}</pre>
                    {reportState}
                </code>

            </Box>
        </>
    )
}
