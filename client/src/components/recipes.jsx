/* eslint-disable react/prop-types */
import { Grid, Box, Card, CardActions, CardContent, Button, Typography, IconButton, Tab, Tabs } from "@mui/material"
import { useEffect, useState } from "react";
import { useUserStore } from "../store";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const buttonstyles = {
    background: "#5765F2",
    color: "white",
    borderRadius: "999px",
}

export const Recipe = ({ recipe }) => {
    const [voted, setVoted] = useState(false)
    const { profile } = useUserStore()
    const navigate = useNavigate()

    const handleViewRecipe = async () => {
        navigate(`/details/${recipe.id}`)
    }

    useEffect(() => {
        const alreadyVoted = () => {
            if (recipe.upvotes.length === 0) {
                return false
            }
            if (recipe.upvotes.some(upvote => upvote.voterId === profile?.id)) {
                return true
            }
        }
        setVoted(alreadyVoted())
    }, [profile, recipe])


    const handleUpVote = async () => {
        try {
            const response = await axios.post("http://localhost:3000/recipe/upvote", {
                recipeId: recipe.id,
                userId: profile.id,
                location: profile.location
            })
            if (response.status === 200) {
                alert("upvoted successufully")
            }
        } catch (error) {
            if (error.response.status === 403) {
                alert("unauthorized, only possible if karma > 49")
            } else {
                alert("something went wrong")
            }
        }

    }

    return (
        <Card sx={{ minWidth: 275, border: 0.5, background: "#EFF1F9", borderRadius: "20px" }} elevation={0}>
            <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 300 }} color="text.secondary">
                            {recipe.user.name}
                        </Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 300 }} color="text.secondary" gutterBottom>
                            {recipe.location}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", borderRadius: "999px" }}>
                        <IconButton disabled={!profile} onClick={handleUpVote} size="small" aria-label="add to favorites">{voted ? <FavoriteIcon /> : <FavoriteBorderIcon />}</IconButton>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>{recipe.upvotes.length}</Typography>
                    </Box>
                </Box>
                <Typography variant="h5" component="div" gutterBottom>
                    {recipe.title}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                    Ingredients: {recipe.ingredients}
                </Typography>
                <Typography variant="body2">
                    Description: {recipe.description}
                </Typography>
            </CardContent>
            <CardActions>
                <Button style={buttonstyles} onClick={handleViewRecipe} disabled={!profile} size="medium" fullWidth variant="outlined" sx={{ borderRadius: "8px" }}>{profile ? "View Recipe" : "Login to View"}</Button>
            </CardActions>
        </Card>
    )
}

// eslint-disable-next-line react/prop-types
function CustomTabPanel({ children, value, index }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export const Recipes = () => {
    const [value, setValue] = useState(0);
    const { profile } = useUserStore()
    const [allRecipes, setAllRecipes] = useState([])
    const [myRecipes, setMyRecipes] = useState([])

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        const fetchRecipes = async () => {
            const response = await axios.get("http://localhost:3000/recipes")
            setAllRecipes(response.data)
            console.log(response.data)
        }
        fetchRecipes()
    }, [])

    useEffect(() => {
        const fetchMyRecipes = async () => {
            const response = await axios.post("http://localhost:3000/recipes/fetch", {
                userId: profile.id
            })
            setMyRecipes(response.data)
        }
        if (profile) {
            fetchMyRecipes()
        }
    }, [profile])

    return (
        <Box sx={{ my: 4, mx: 0 }}>
            <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ background: "#EFF1F9", borderRadius: "999px", color: "white" }} aria-label="basic tabs example">
                <Tab label="All Recipes" sx={{ px: 2, m: 0 }} background="white" textColor="white" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                <Tab label="My Recipes" sx={{ px: 2, m: 0 }} textColor="white" id="simple-tab-1" disabled={!profile} aria-controls="simple-tabpanel-1" />
            </Tabs>
            <CustomTabPanel value={value} index={0}>
                <Grid container sx={{ border: "1px", borderColor: "#5765F2" }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12 }}>
                    {allRecipes?.map((recipe, index) => (
                        <Grid item xs={2} sm={4} md={4} key={index}>
                            <Recipe key={index} recipe={recipe} />
                        </Grid>
                    ))}
                </Grid>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <Grid container sx={{ border: "1px", borderColor: "#5765F2" }} spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 8, md: 12 }}>
                    {myRecipes?.map((recipe, index) => (
                        <Grid item xs={2} sm={4} md={4} key={index}>
                            <Recipe key={index} recipe={recipe} />
                        </Grid>
                    ))}
                </Grid>
            </CustomTabPanel>
        </Box>
    )
}