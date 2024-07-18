"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;
export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};
// Function to sign in a user using their email and password
export const signIn = async ({ email, password }: signInProps) => {
  try {
    // Create an admin client instance
    const { account } = await createAdminClient();
    // Attempt to create a session using the provided email and password

    const response = await account.createEmailPasswordSession(email, password);
    // Parse and return the response
    return parseStringify(response);
  } catch (error) {
    console.error("Error", error);
  }
};
// Function to sign up a new user
export const signUp = async (userData: SignUpParams) => {
  const { email, password, firstName, lastName } = userData;
  try {
    // Create an admin client instance
    const { account } = await createAdminClient();
    // Create a new user account with the provided details

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );
    // Create a session for the new user
    const session = await account.createEmailPasswordSession(email, password);
    // Set a cookie with the session secret for secure authentication
    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    // Parse and return the new user account details
    return parseStringify(newUserAccount);
  } catch (error) {
    console.error("Error", error);
  }
};

// Function to get the logged-in user's details
// export async function getLoggedInUser() {
//   try {
//     // Create a session client instance
//     const { account } = await createSessionClient();
//     // Fetch the logged-in user's details
//     const user = await account.get();
//     // Parse and return the user's details
//     console.log(user);
//     return parseStringify(user);
//   } catch (error) {
//     // Return null if any error occurs (e.g., user is not logged in)
//     return null;
//   }
// }

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    // const user = await getUserInfo({ userId: result.$id });

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    // Create a session client instance
    const { account } = await createSessionClient();
    // Clear the session cookie
    cookies().delete("appwrite-session");
    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
};
