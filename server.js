const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs')

app.use(bodyParser.json());
app.use(express.static('./build'));
app.set('trust proxy', true)
const session = require('cookie-session');
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));


const mysql = require('mysql2');
var sql_Connect = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  port: process.env.MYSQLPORT,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10
});



app.get("/health", (req, res) => {
  res.status(200).send("ok");
})

// [老師專用] 取得所有學生資料 (含帳號密碼)
app.get("/api/getallstudents", (req, res) => {
  if (req.session.role === "teacher") {
    sql_Connect.getConnection(function (err, connection) {
      connection.query('SELECT id,username,userid,userpassword FROM userData2', function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          connection.release();

          return
        }
        if (results.length > 0) {
          res.send(JSON.stringify({ message: 'Success', data: { result: results }, ok: true }));
          connection.release();

        } else {
          res.status(404).json({ message: 'Not found', ok: false, code: 404 });
          connection.release();

        }

        res.end();
      })
    })
  } else {
    res.status(403).json({ message: 'Forbidden', ok: false, code: 403 });
    res.end();
  }
})

// [老師專用] 取得所有學生資料 (僅帳號 -- 渲染全班成績用)
app.get("/api/getallstudentsforscore", (req, res) => {
  if (req.session.role === "teacher") {
    sql_Connect.getConnection(function (err, connection) {
      connection.query(`SELECT id,username,userid,role FROM userData2 WHERE role = 'std' `, function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          connection.release();

          return
        }
        if (results.length > 0) {
          res.send(JSON.stringify({ message: 'Success', data: { result: results }, ok: true }));
          connection.release();

        } else {
          res.status(404).json({ message: 'Not Found', ok: false, code: 404 });
          connection.release();

        }

        res.end();
      })
      connection.release();

    })
  } else {
    res.status(403).json({ message: 'Forbidden', ok: false, code: 403 });
    res.end();
  }
})


app.get('*', (req, res) => {
  res.sendFile('index.html', { root: './build' });
})

// 登入系統
app.post('/api/login', async (req, res) => {
  function login() {

    sql_Connect.getConnection(function (err, connection) {
      connection.query('SELECT * FROM userData2 WHERE userid = ? AND userpassword = ?', [userid ? userid : "NULL", password ? password : "NULL"], function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: '伺服器錯誤，請稍後再嘗試登入', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          connection.release()
          return
        }
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = results[0].username;
          req.session.userid = results[0].userid
          req.session.role = results[0].role
          console.log(`[USER LOGIN (SUCCESS)] IP:${req.ip} User:${req.session.username}`)

          res.send(JSON.stringify({ message: '登入成功', data: { userid: results[0].userid, username: results[0].username, role: results[0].role }, ok: true }));
        } else {
          req.session = null
          console.log(`[USER LOGIN (FAILED) ] IP:${req.ip} reason:incorrect password or id`)
          res.status(401).json({ message: '帳號或密碼錯誤\n如果持續無法登入，請聯絡老師重設密碼', ok: false, code: 401 });
        }
        res.end();
      })
      connection.release();

    })
  }

  const { userid, password, recaptcha } = req.body;
  const secretKey = process.env.recaptcha

  console.log(`[USER TRYING LOGIN] IP:${req.ip} User:${userid}`)

  await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptcha}`
  ).then(gres => gres.json())
    .then(googleRes => {
      if (googleRes.success) {
        login()
      } else {
        console.log(`[USER LOGIN FAILED] IP:${req.ip} reason:recaptcha verify error`)
        res.status(401).json({ message: 'recaptcha驗證失敗，請重新驗證', ok: false, code: 401 });
      }
    })
    .catch((e) => {
      console.log(`[USER LOGIN FAILED] IP:${req.ip} reason:recaptcha verify error`)
      console.warn(e)
      res.status(401).json({ message: 'recaptcha驗證失敗，請重新驗證', ok: false, code: 401 });
    })
});

// 連線測試，確認session狀態
app.post("/api/connection/test", (req, res) => {

  if (req.session.role) {
    res.status(200).json({ message: 'ok', ok: true, code: 200 });
  } else {
    res.status(403).json({ message: 'Session Not Found !', ok: false, code: 403 });
    res.end();
  }
})


// [老師專用] 依據uid搜尋所有學生成績
app.post("/api/getallstudentscorebyid", (req, res) => {
  if (req.session.role === "teacher") {
    sql_Connect.getConnection(function (err, connection) {
      connection.query(`SELECT id,stdId,?? FROM scoreData2`, [req.body.uid], function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          connection.release();

          return
        }
        if (results.length > 0) {

          res.send(JSON.stringify({ message: 'Success', data: { result: results }, ok: true }));
          connection.release();

        } else {
          res.status(404).json({ message: 'Not Found', ok: false, code: 404 });
          connection.release();

        }
        res.end();
      })
      connection.release();

    })
  } else {
    res.status(403).json({ message: 'Forbidden', code: 403, ok: false });
    res.end();
  }
})

// [老師專用] 幫學生修改密碼
app.post("/api/changepassword/student", (req, res) => {

  if (req.session.role === "teacher") {
    sql_Connect.getConnection(function (err, connection) {
      connection.query(`
            UPDATE userData2
            SET userpassword = ?
            WHERE id = ?
            `, [req.body.password, req.body.id], function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          connection.release();

          return
        }

        res.send(JSON.stringify({ message: 'Success', data: { result: results }, ok: true }));

        res.end();
        connection.release();


      })
      connection.release();

    })
  } else {
    res.status(403).json({ code: 403, message: 'Forbidden', ok: false });
    res.end();
  }
})

// [老師專用] 更新個別學生的成績與備註
app.post("/api/updatescore", (req, res) => {
  console.log(`[HTTP POST] /api/updatescore\nUser:${req.session.username}`)

  if (req.session.role === "teacher") {
    sql_Connect.getConnection(function (err, connection) {
      connection.query(`
            UPDATE scoreData2
            SET ${req.body.scoreid} = "${req.body.scoreData}"
            WHERE id = ${req.body.id}
            `, function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          connection.release();

          return
        }
        res.send(JSON.stringify({ message: 'Success', data: { result: results }, ok: true }));
        res.end();

      })
      connection.release();

    })
  } else {
    res.status(403).json({ code: 403, message: 'Forbidden', ok: false });
    res.end();
  }
})

// [老師專用] 更新成績設定
app.post("/api/updatescoresetting", (req, res) => {
  console.log(`[HTTP POST] /api/updatescoresetting User:${req.session.username}`)

  if (req.session.role === "teacher") {
    sql_Connect.getConnection(function (err, connection) {
      connection.query(`
            UPDATE scoreUid2
            SET scoreName = "${req.body.title}", subject = "${req.body.tags}", summery = "${req.body.annousment}"
            WHERE uid = "${req.body.scoreid}"
            `, function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          connection.release();

          return
        }

        res.send(JSON.stringify({ message: 'Success', data: { result: results }, ok: true }));

        res.end();
      })
      connection.release();

    })
  } else {
    res.status(403).json({ code: 403, message: 'Forbidden', ok: false });
    res.end();
  }
})

// [老師專用] 刪除成績
app.post("/api/deletescore", (req, res) => {
  console.log(`[HTTP POST] /api/deletescore\n${req.body.scoreid}\nUser:${req.session.username}`)
  if (req.session.role === "teacher") {
    sql_Connect.getConnection(function (err, connection) {
      connection.query(`
            ALTER TABLE scoreData2
            DROP COLUMN ??;
            `, [req.body.scoreid], function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: 'sever error 500', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          connection.release();

          return
        }
        connection.release();

        sql_Connect.getConnection(function (err, connection2) {
          connection2.query(`
            DELETE FROM scoreUid2
            WHERE uid = ?;
            `, [req.body.scoreid], function (error2, results2, fields) {
            if (error2) {
              res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
              console.warn("[SEVER ERROR]", error2)
              connection2.release();

              return
            }
            res.send(JSON.stringify({ message: 'Success', data: { result: results }, ok: true }));

            res.end();
            connection2.release();
          })
        })
      })
    })
  } else {
    res.status(403).json({ code: 403, message: 'Forbidden', ok: false });
    res.end();
  }
})

// [老師專用] 寫入新成績
app.post("/api/uploadnewscore", async (req, res) => {
  function getRandomInt(min, max) { // 生成範圍內的隨機整數
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
  function getRandomLatter() {
    return String.fromCharCode(getRandomInt(97, 122)) // 隨機生成小寫英文字母
  }
  if (req.session.role !== "teacher") {
    res.status(403).json({ code: 403, message: 'Forbidden', ok: false });
    return
  }


  var theUUID = uuidv4().slice(0, 7).replace("e", "k") + getRandomLatter()
  // 生成UUID
  // 新增欄位
  // 放入所有資料

  sql_Connect.getConnection(function (err, connection) {
    connection.query(
      `INSERT INTO scoreUid2(uid, scoreName, scoresetuid, subject, summery, publish)
            VALUES(?,?,?,?,?,?)`
      , [theUUID, req.body.score.title, theUUID, req.body.score.subject, req.body.score.annousment, req.body.method === "publish"], function (error, results, fields) {
        if (error) {
          console.warn("[SEVER ERROR]", error)
          connection.release();

          return
        }
        connection.release();

        sql_Connect.getConnection(function (err, connection2) {
          connection2.query(
            `ALTER TABLE scoreData2
                    ADD COLUMN ${theUUID} TEXT;`
            , function (error2, results, fields) {
              if (error2) {

                console.warn("[SEVER ERROR]", error2)
                connection2.release();

                return
              }
              req.body.score.scoreData.forEach((score, i) => {
                sql_Connect.getConnection(function (err, connection3) {

                  var index = i,
                    text = `${req.body.score.scoreData[index] !== null && req.body.score.scoreData[index] ? req.body.score.scoreData[index] : null
                      } %|% ${req.body.score.summeryData[index] !== null && req.body.score.summeryData[index] ? req.body.score.summeryData[index] : null}`

                  connection3.query(
                    `UPDATE scoreData2
                  SET ${theUUID} = "${req.body.score.scoreData[index] !== null && req.body.score.scoreData[index] ? req.body.score.scoreData[index] : null}%|%${req.body.score.summeryData[index] !== null && req.body.score.summeryData[index] ? req.body.score.summeryData[index] : null}"
                  WHERE id = ${index};`, function (error3, results, fields) {
                    if (error3) {
                      console.warn("[SEVER ERROR]", error3)

                      return
                    }
                    connection3.release();
                  })
                })
              })
              connection2.release();
              res.status(200).json({ message: 'ok', ok: true, uuid: theUUID });
            })
        })
      })
  })
})

// [學生/家長] 依據id查詢個人成績
app.post("/api/getscorebyid", (req, res) => {
  function calcAvgAndSendScore(results, results2) {
    var highest = 0, lowest = 0, average = 0, total = 0, scoreList = []

    for (i = 0; i < results2.length; i++) {
      if (results2[i][req.body.id].split("%|%")[0] !== 'null' && results2[i][req.body.id].split("%|%")[0] !== 'undefined') {
        total += Number(results2[i][req.body.id].split("%|%")[0])
        scoreList.push(Number(results2[i][req.body.id].split("%|%")[0]))
      }
    }
    highest = Math.max(...scoreList)
    lowest = Math.min(...scoreList)

    average = (total / scoreList.length).toFixed(2)

    res.send(JSON.stringify({ message: 'ok', data: { hi: highest, lo: lowest, avg: average, your: results[0][req.body.id].split("%|%")[0], privateMsg: results[0][req.body.id].split("%|%")[1], }, ok: true }));

  }

  console.log(`[GET SCORE BY ID] User:${req.session.username} IP:${req.ip} Query:${req.body.id}`)
  if (req.session.role) {
    sql_Connect.getConnection(function (err, connection) {
      connection.query(`SELECT * FROM scoreData2 WHERE stdId = "${req.session.userid.replace("p", "s")}" `, function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          connection.release()
          return
        }
        if (results.length > 0) {//繼續查最高/最低/平均


          sql_Connect.getConnection(function (err, connection2) {
            connection2.query(`SELECT ?? FROM scoreData2`, [req.body.id], function (error2, results2, fields2) {
              if (error2) {
                res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
                console.warn("[SEVER ERROR]", error2)
                connection2.release();
              };

              calcAvgAndSendScore(results, results2)
              connection2.release();

            })
          })

        } else {
          res.status(500).json({ message: '請刷新網站', ok: false, code: 500 });
        }

        connection.release();
      })
    })
  } else {
    res.status(403).json({ code: 403, message: 'Forbidden', ok: false });
    res.end();
  }

})

// 所有成績列表
app.post("/api/getscoremap", (req, res) => {

  sql_Connect.getConnection(function (err, connection) {
    connection.query('SELECT * FROM scoreUid2', function (error, results, fields) {
      if (error) {
        res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
        console.warn("[SEVER ERROR]", error)
        connection.release();

        return
      };
      res.send(JSON.stringify({ message: 'Success', data: { result: results }, ok: true }));
      connection.release();

      res.end();
      connection.release();
    })
  })
})

//更改密碼
app.post("/api/changepass", (req, res) => {
  console.log("[CHANGE PASSWORD] \nUser: ", req.session.username, "\n")
  if (req.session.userid === req.body.userid) { //確認使用者


    sql_Connect.getConnection(function (err, connection) {
      connection.query(`
    SELECT * FROM userData2
    WHERE userid = ?
    `, [req.body.userid], function (error, results, fields) {
        if (error) {
          res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
          console.warn("[SEVER ERROR]", error)
          return
        }

        if (results[0].userpassword === req.body.oldpass) { //再檢查一遍舊密碼
          //如果相同就更新
          sql_Connect.getConnection(function (err, connection2) {
            connection2.query(`
          UPDATE userData2
          SET userpassword = ?
          WHERE userid = ?
          `, [req.body.newpass, req.body.userid], function (error, results2, fields) {
              if (error) {
                res.status(500).json({ message: 'Internal Service Error', ok: false, code: 500 });
                console.warn("[SEVER ERROR]", error)

                return
              }
              res.send(JSON.stringify({ message: 'ok', data: { result: results2 }, ok: true }));
              res.end();
              connection2.release();
            })
          })

        } else {
          res.status(403).json({ message: 'Password Incorrect', ok: false, code: 403 });
        }

        connection.release();
      })
    })

    req.session = null //撤銷session，請使用者重新登入
  } else {
    res.status(403).json({ code: 403, message: 'Forbidden', ok: false });
    res.end();
  }
})

// 取得系統公告
app.post("/api/service/annoucement", (req, res) => {
  console.log(`[GET ANNOUNCEMENT] Page:${req.body.page} User:${req.session.username} IP:${req.ip}`)
  sql_Connect.getConnection(function (err, connection) {
    connection.query(`
      SELECT * FROM announcement WHERE display=1
    `, function (error, results, field) {
      if (error) {
        res.status(500).json({ title: null, body: null, type: null, updateTime: null })
        connection.release()

        return
      }
      if (results.length > 0) {
        res.status(200).json({ title: results[0].title, body: results[0].body, type: results[0].type, updateTime: results[0].time, action: results[0].action })
      } else {
        res.status(200).json({ title: null, body: null, type: null, updateTime: null, action: null })
      }
      connection.release()

    })
    connection.release()
  })
})

// 檢查使用者是否登入
app.post("/api/checklogin", async (req, res) => {
  console.log(`[CHECK LOGIN] Page:${req.body.page} User:${req.session.username} IP:${req.ip}`)

  res.send(JSON.stringify(
    {
      loggedIn: req.session.loggedin,
      data: {
        data: {
          userid: req.session.userid,
          username: req.session.username,
          role: req.session.role,

        }
      }
    }))
})

// 登出
app.post("/api/logout", (req, res) => {
  console.log(`[USER LOGOUT] User:${req.session.username} IP:${req.ip}`)
  req.session = null
  res.send(JSON.stringify({ message: 'logout successful', ok: true }))
})

// 回報錯誤
app.post("/api/report/pusherrorlog", (req, res) => {
  console.log(`[ERROR REPORT] ID:${req.body.randomCode} FROM:${req.session.username} IP:${req.ip}`)
  sql_Connect.getConnection(function (err, connection) {
    connection.query(`
      INSERT INTO errorReport (random_code,username,error_code,time,path)
      VALUES(?,?,?,?,?)
    `, [req.body.randomCode, req.session.username, req.body.errorCode, req.body.time, req.body.path], function (error, results, field) {
      if (err) { console.log("[SERVER ERROR]", err); connection.release() }
      res.status(200).json({ message: "錯誤回報成功", code: 200, ok: true })
      connection.release()
    })
  })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

