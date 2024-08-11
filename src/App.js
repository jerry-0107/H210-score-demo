import './App.css';
import LoginForm from './LoginForm';
import React, { useState } from 'react';
import { Homepage } from './pages/home';
import { Route, Routes } from 'react-router-dom'
import { Score } from './pages/score';
import { TeacherHomePage } from './pages/teacherHome';
import { AllScoreSheet } from './pages/allscores';
import { PushNewScore } from './pages/pushNewScore';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { SearchScoreSheet } from './pages/searchScores';
import { AllAccountSheet } from './pages/allaccounts';
import { StudentAccounts } from './pages/studentaccounts';
import { ParentAccounts } from './pages/parentaccounts';
import { TeacherScore } from './pages/teacherscore';
import { Profile } from './pages/profile';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Setting } from './pages/setting';
import useMediaQuery from '@mui/material/useMediaQuery';
import Routing from './pages/route';
import { ErrorPage } from './pages/errorPage';

function App() {
  const [loading, setLoading] = React.useState(true)

  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem(""));
  const [userData, setUserData] = useState([])

  const [pageError, setPageError] = React.useState([false, 0])

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });


  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const systemTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  const currentTheme = (
    localStorage.getItem("theme") == "light" ? lightTheme :
      localStorage.getItem("theme") == "dark" ? darkTheme :
        systemTheme
  )

  function handleCallBack(data) {
    setUserData(data)
  }

  React.useEffect(() => {
    fetch("/api/checklogin", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page: window.location.pathname + window.location.search }),
    })
      .then(res => res.json())
      .then(res => {
        setLoading(false)

        if (res.loggedIn) {
          setIsLoggedIn(res.loggedIn)
          setUserData(res.data)
        }
      })
  }, [])

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {
        !pageError[0] ?
          !loading ?
            isLoggedIn ?
              <Routes>
                <Route path='/route/to/*' element={<Routing data={userData} handleError={setPageError} />} ></Route>

                <Route path='/profile' element={<Profile data={userData} handleError={setPageError} />} ></Route>
                <Route path='/setting' element={<Setting data={userData} handleError={setPageError} />} ></Route>

                {userData.data.role === "teacher" ?
                  <Route path='/' element={<TeacherHomePage data={userData} handleError={setPageError} />} ></Route>
                  : <Route path='/' element={<Homepage data={userData} handleError={setPageError} />} ></Route>
                }


                {
                  userData.data.role !== "teacher" ?
                    <Route path='/score' element={<Score data={userData} handleError={setPageError} />} ></Route>
                    :
                    <Route path='/score' element={<SearchScoreSheet data={userData} handleError={setPageError} />} ></Route>

                }


                {userData.data.role === "teacher" ?
                  <>
                    <Route path='/backend' element={<TeacherHomePage data={userData} handleError={setPageError} />}></Route>
                    <Route path='/backend/score' element={<AllScoreSheet data={userData} handleError={setPageError} />}></Route>
                    <Route path='/backend/score/push' element={<PushNewScore data={userData} handleError={setPageError} />}></Route>
                    <Route path='/backend/score/search' element={<SearchScoreSheet data={userData} handleError={setPageError} />} ></Route>

                    <Route path='/backend/account' element={<AllAccountSheet data={userData} handleError={setPageError} />}></Route>
                    <Route path='/backend/account/student' element={<StudentAccounts data={userData} handleError={setPageError} />}></Route>
                    <Route path='/backend/account/parent' element={<ParentAccounts data={userData} handleError={setPageError} />}></Route>
                    <Route path='/score/class' element={<TeacherScore data={userData} handleError={setPageError} />}></Route>

                  </>
                  : <></>}
                <Route path='*' element={<Homepage data={userData} handleError={setPageError} />}></Route>

              </Routes>
              :
              <Routes>
                <Route path='*' element={<LoginForm set={setIsLoggedIn} callback={handleCallBack} handleError={setPageError} />} ></Route>
              </Routes>
            :
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={loading}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          : <ErrorPage errorId={pageError[1]} data={userData} errorSummery={pageError < 2 ? "NULL" : pageError[2]} />
      }
    </ThemeProvider>
  );
}

export default App;
