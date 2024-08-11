import * as React from 'react'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export function AlertDialog({ title, message }) {
    const [isAlertOpen, setAlertOpen] = React.useState(true);

    const handleShowAlert = () => {
        setAlertOpen(true);
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    return (
        <Dialog open={isAlertOpen} onClose={handleAlertClose} BackdropClick={false}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{message}</DialogContent>
            <DialogActions>
                <Button onClick={handleAlertClose} color="primary">
                    確定
                </Button>
            </DialogActions>
        </Dialog>
    )
}