const express = require("express");
const axios = require("axios");
const cors = require("cors");
const updateOpaData = require("./src/update-opa-data").updateOpaData;
const recipeApi = require("./src/recipe-api");
const userApi = require("./src/user-api");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// generic authz middleware, checks if user is chef means has karma > 49
const authz = async (req: any, res: any, next: any) => {
  const userid = parseInt(req.body.userId);
  const recipeid = parseInt(req.body.recipeId);
  const location = req.body.location;
  const check = await axios.post(
    "http://localhost:8181/v1/data/app/rbac/allow",
    {
      input: {
        user: userid,
        recipe: recipeid,
        location: location,
      },
    }
  );
  if (check.data.result) {
    next();
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
};

app.get("/", (req: any, res: any) => {
  res.send("Hello World!");
});

app.post("/profile", async (req: any, res: any) => {
  // requires authN
  const user = await userApi.fetchProfile(req.body.user);
  return res.status(200).json(user);
});

app.post("/updateLocation", async (req: any, res: any) => {
  // requires authN
  const user = await userApi.updateLocation(req.body.user, req.body.location);
  const response = await updateOpaData();
  return res.status(200).json(user);
});

app.get("/recipes", async (req: any, res: any) => {
  // requires nothing
  const recipes = await recipeApi.fetchRecipes();
  return res.status(200).json(recipes);
});

app.post("/recipe/fetch", authz, async (req: any, res: any) => {
  // requires authN and authz
  const recipe = await recipeApi.fetchRecipe(req.body.recipeId);
  return res.status(200).json(recipe);
});

app.post("/recipes/fetch", async (req: any, res: any) => {
  // requires authN
  const recipes = await recipeApi.fetchRecipes(req.body.userId);
  return res.status(200).json(recipes);
});

app.post("/recipe", async (req: any, res: any) => {
  // requires authN
  const recipeObj = {
    title: req.body.title,
    description: req.body.description,
    ingredients: req.body.ingredients,
    location: req.body.location,
    user: { connect: { id: req.body.userId } },
  };
  const recipe = await recipeApi.createRecipe(recipeObj);
  const response = await updateOpaData();
  return res.status(200).json(recipe);
});

app.post("/recipe/upvote", authz, async (req: any, res: any) => {
  // requires authz
  const recipeId = req.body.recipeId;
  const voterId = req.body.userId;
  const recipe = await recipeApi.upvoteRecipe(recipeId, voterId);
  const response = await updateOpaData();
  return res.status(200).json(recipe);
});

// app.post("/recipe/remove", async (req: any, res: any) => {
//   // requires opal authz
//   const recipeId = req.body.recipeId;
//   const userId = req.body.userId;
//   const removed = await recipeApi.removeRecipe(recipeId, userId);
//   return res.status(200).json({ message: "Recipe removed" });
// });

app.listen(port, () => {
  console.log(`app server listening on port ${port}`);
});
