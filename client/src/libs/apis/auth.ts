import axios from "axios";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post("/auth/login", { email, password });

    if (response.status !== 200) {
      console.log("Something want wrong while login");
    }
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const signupUser = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await axios.post("/auth/register", {
      username,
      email,
      password,
    });

    if (response.status !== 200) {
      console.log("Something went wrong while signup");
    }

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await axios.post('/auth/logout')
    if(response.status !== 200){
        console.log("Logout Failed");
    }
    return response
  } catch (error) {
    console.log(error);
  }
};

export const googleOauth = async () => {
  try {
    const response = await axios.get("/auth/google/login");

    if (response.status !== 200) {
      console.log("Something went wrong while oauth");
    }

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUser = async () => {
  try {
    const response = await axios.get("/auth/me");
    if (response.status !== 200) {
      console.log("Somwthing went wrong while auth");
    }
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
