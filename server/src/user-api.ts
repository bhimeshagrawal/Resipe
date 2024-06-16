const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export const fetchProfile = async (user: any) => {
  // checking if new login
  const checkuser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });
  if (checkuser) {
    return checkuser;
  } else {
    const newuser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        location: "india",
      },
    });
    return newuser;
  }
};

export const updateLocation = async (user: any, location: any) => {
  const updatedUser = await prisma.user.update({
    where: { email: user.email },
    data: {
      location: location,
    },
  });
  return updatedUser;
};
