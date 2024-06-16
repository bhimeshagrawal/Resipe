import { Box, Container, Typography } from "@mui/material"
import { useParams } from "react-router-dom"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useUserStore } from "../store"
import { Nav } from "../components/nav"

export default function Details() {
    const [recipeId] = useState(useParams().recipeId)
    const [recipe, setRecipe] = useState()
    const navigate = useNavigate()
    const { profile } = useUserStore()

    useEffect(() => {
        console.log(" i run")
        if (profile && !recipe) {
            const fetchRecipe = async () => {
                try {
                    console.log(recipeId, profile.id, profile.location)
                    const response = await axios.post(`http://localhost:3000/recipe/fetch`, {
                        recipeId: recipeId,
                        userId: profile.id,
                        location: profile.location
                    })
                    if (response.status === 200) {
                        setRecipe(response.data)
                    }
                } catch (err) {
                    if (err.response.status === 403) {
                        alert("You are not authorized to view this recipe, try changing your location or become chef by having karma > 49")
                        navigate("/")
                    } else {
                        alert("something went wrong")
                    }
                }
            }
            fetchRecipe()
        }
    }, [])

    return (
        <Container>
            <Nav />
            <Box sx={{ mt: 4, border: 1, p: 2, borderColor: 'grey', display: "flex", justifyContent: "space-between", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", background: "#EFF1F9" }}>
                <Box>
                    <Typography variant="h3" gutterBottom>{recipe?.title}</Typography>
                    <Typography variant="subtitle1">{recipe?.user.name}</Typography>
                    <Typography variant="subtitle1">{recipe?.location}</Typography>
                </Box>
            </Box>
            <Box sx={{ border: 1, borderTop: 0, p: 2, borderColor: 'grey' }}>
                <Typography variant="h6">Ingredients</Typography>
                <Typography variant="subtitle1">{recipe?.ingredients}</Typography>
            </Box>
            <Box sx={{ border: 1, borderTop: 0, p: 2, borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px", borderColor: 'grey', background: "#EFF1F9" }}>
                <Typography variant="h6">Description</Typography>
                <Typography variant="subtitle1">{recipe?.description}</Typography>
            </Box>
        </Container>
    )
}