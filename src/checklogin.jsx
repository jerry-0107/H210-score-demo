import * as React from 'react'

export function CheckLogin({ run, userData }) {

    React.useEffect(() => {
        if (run && !window.location.href.includes("/route/to")) {
            fetch("/api/checklogin", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page: window.location.pathname + window.location.search
                }),
            })
                .then(res => res.json())
                .then(res => {
                    if (!res.loggedIn) {
                        alert("請重新登入")
                        window.location.reload()
                    }

                })
        }
    }, [])

    return <></>
}