const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export const fetchRecipe = async (recipeId: string) => {
  const recipe = await prisma.recipe.findUnique({
    where: {
      id: parseInt(recipeId),
    },
    include: {
      upvotes: true,
      user: true,
    },
  });
  return recipe;
};

export const fetchRecipes = async (userId = "") => {
  if (userId !== "") {
    const recipes = await prisma.recipe.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        upvotes: true,
        user: true,
      },
    });
    return recipes;
  } else {
    const recipes = await prisma.recipe.findMany({
      include: {
        upvotes: true,
        user: true,
      },
    });
    return recipes;
  }
};

export const createRecipe = async (recipe: any) => {
  const newRecipe = await prisma.recipe.create({
    data: recipe,
  });
  // increase karma by 50
  const user = await prisma.user.update({
    where: { id: parseInt(recipe.user.connect.id) },
    data: {
      karma: { increment: 50 },
    },
  });
  return newRecipe;
};

export const upvoteRecipe = async (recipeId: any, voterId: any) => {
  const upvote = await prisma.upvote.create({
    data: {
      voter: { connect: { id: parseInt(voterId) } },
      recipe: { connect: { id: parseInt(recipeId) } },
    },
  });
  const recipe = await prisma.recipe.update({
    where: { id: parseInt(recipeId) },
    data: {
      upvotes: { connect: { id: parseInt(upvote.id) } },
    },
  });
  const user = await prisma.user.update({
    where: { id: recipe.userId },
    data: {
      karma: { increment: 10 },
    },
  });
  return recipe;
};

export const removeRecipe = async (recipeId: number, userId: number) => {
  const recipe = await prisma.recipe.delete({
    where: { id: recipeId },
  });
  return true;
};
