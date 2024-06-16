import { Container, Box, TextField, Button, Typography } from "@mui/material"
import { useState } from "react"
import { useUserStore } from "../store"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Nav } from "../components/nav"

const buttonstyles = {
    background: "#5765F2",
    color: "white",
    borderRadius: "999px",
    marginTop: "20px"
}

export default function AddRecipe() {
    const [title, setTitle] = useState("")
    const [ingredients, setIngredients] = useState("")
    const [description, setDescription] = useState("")
    const { profile } = useUserStore()
    const navigate = useNavigate()

    const handleTitle = (e) => {
        setTitle(e.target.value)
    }
    const handleIngredients = (e) => {
        setIngredients(e.target.value)
    }
    const handleDescription = (e) => {
        setDescription(e.target.value)
    }
    const clearFields = () => {
        setTitle("")
        setIngredients("")
        setDescription("")
    }
    const handleSubmit = async () => {
        const response = await axios.post("http://localhost:3000/recipe", {
            title: title,
            ingredients: ingredients,
            description: description,
            userId: profile.id,
            location: profile.location
        })
        if (response.status == 403) {
            alert("You are not authorized to add recipe")
            clearFields()
        } else if (response.status == 200) {
            alert("Recipe added successfully")
            clearFields()
            navigate("/")
        } else {
            alert("Something went wrong")
        }
    }

    return (
        <Container>
            <Nav />
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <Box sx={{ border: 0.5, p: 4, minWidth: "400px", background: "#EFF1F9", borderRadius: "20px" }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>Create Recipe</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <TextField fullWidth id="standard-basic" value={title} onChange={handleTitle} label="Title here..." variant="standard" />
                    </Box>
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <TextField fullWidth id="standard-basic" value={ingredients} onChange={handleIngredients} label="Ingredients here..." variant="standard" />
                    </Box>
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <TextField fullWidth id="standard-basic" value={description} onChange={handleDescription} label="Description here..." variant="standard" />
                    </Box>
                    <Button fullWidth style={buttonstyles} variant="contained" onClick={handleSubmit}>Create</Button>
                </Box>
            </Box>
        </Container>
    )
}