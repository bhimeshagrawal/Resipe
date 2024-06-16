import { useAuth0 } from '@auth0/auth0-react'
import { Typography, Stack, Button, InputLabel, MenuItem, FormControl, Select, Tooltip } from '@mui/material';
import { useState, useEffect } from 'react';
import { useUserStore } from '../store';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const buttonstyles = {
    background: "#5765F2",
    color: "white",
    borderRadius: "999px",
}

export const Nav = () => {
    const [location, setLocation] = useState('');
    const { setUser, profile, setProfile, setRole } = useUserStore()
    const { loginWithRedirect, user, isAuthenticated, logout } = useAuth0()
    const navigate = useNavigate()

    const auth = () => {
        if (isAuthenticated) {
            logout({ logoutParams: { returnTo: window.location.origin } })
        } else {
            loginWithRedirect()
        }
    }

    useEffect(() => {
        setUser(user)
        const fetchProfile = async () => {
            const response = await axios.post(`http://localhost:3000/profile`, {
                user: user
            })
            setProfile(response.data)
            setRole("Chef")
            setLocation(response.data.location)
        }
        if (isAuthenticated == true) {
            fetchProfile()

        }
    }, [isAuthenticated])

    const handleAddRecipe = () => {
        navigate("/add")
    }

    const handleChange = async (event) => {
        const response = await axios.post(`http://localhost:3000/updateLocation`, {
            user: user,
            location: event.target.value
        })
        if (response.status == 200) {
            alert("changed location success")
        }
        setLocation(event.target.value);
    };

    return (
        <>
            <Stack sx={{ mt: 2 }} direction={'row'} justifyContent="space-between" alignItems='center' useFlexGap>
                <Link to="/" style={{ textDecoration: "none" }}><Typography variant="h5" sx={{ color: "black", textDecoration: "none" }} fontWeight={700}>
                    Resipe.</Typography></Link>
                <Stack spacing={2} direction={'row'} alignItems='center'>
                    {profile && <Typography variant='body1' sx={{ p: 1, px: 2, borderRadius: "999px", background: "#EFF1F9" }} fontWeight={400}>{profile.name}</Typography>}
                    {profile && <Typography sx={{ p: 1, px: 2, borderRadius: "999px", background: "#EFF1F9" }}>karma: {profile.karma}</Typography>}
                    {profile && <FormControl sx={{ width: 240, background: "#EFF1F9", borderRadius: "999px" }} size='small'>
                        <InputLabel id="demo-simple-select-label" sx={{ width: 240 }}>Set Current Location</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={location}
                            label="Set Current Location"
                            onChange={handleChange}
                            size='small'
                            sx={{ borderRadius: "999px", }}
                        >
                            <MenuItem value={"india"}>India</MenuItem>
                            <MenuItem value={"us"}>US</MenuItem>
                            <MenuItem value={'others'}>Others</MenuItem>
                        </Select>
                    </FormControl>}
                    {profile && <Tooltip title="Increase 50 karma"><Button sx={{ p: 1, px: 2 }} style={buttonstyles} variant="contained" size='small' onClick={handleAddRecipe}>Add new Recipe</Button></Tooltip>}
                    <Button sx={{ p: 1, px: 2 }} style={buttonstyles} variant='contained' size='small' onClick={() => auth()}>{isAuthenticated ? 'Logout' : 'Login'}</Button>
                </Stack>
            </Stack>
        </>
    )
}