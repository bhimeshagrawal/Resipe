import { Container, Typography, Modal, Box } from '@mui/material'
import { Nav } from '../components/nav'
import { Recipes } from '../components/recipes'
import { useUserStore } from '../store'


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 8,
    outline: 0,
    boxShadow: 24,
    p: 4,
};

export default function Root() {
    const { showModal, closeModal } = useUserStore()
    const { profile } = useUserStore()

    const handleClose = () => closeModal();

    return (
        <Container>
            <Nav />
            <Recipes />
            <Modal
                open={showModal}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" fontWeight={700} variant="h5" component="h2">
                        Hii, welcome to Resipe.
                    </Typography>
                    <Typography sx={{ mt: 4 }}>
                        A recipe sharing webapp where users karma and location affect their permissions to upvote and view recipes
                    </Typography>
                    {profile && profile?.karma < 50 && <Typography sx={{ mt: 2 }}>
                        You are currently <b>Foodie</b>, add 1 recipe to get <b>Chef</b> role.
                    </Typography>}
                    {(profile && profile?.karma < 50) &&
                        <Typography sx={{ mt: 2 }}>
                            Foodies can view same country recipes and cannot upvote.
                        </Typography>
                    }
                    {profile && profile?.karma >= 50 &&
                        <Typography sx={{ mt: 2 }}>
                            You are a <b>Chef</b> and you can view all country recipes and can upvote.
                        </Typography>
                    }
                    <Typography variant='body2' color="#5765F2" sx={{ mt: 4 }}>*Click away from this box to continue</Typography>
                </Box>
            </Modal>
        </Container>
    )
}