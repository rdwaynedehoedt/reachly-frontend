The 2024 Guide to Next.js User Login with Asgardeo and Auth.js-Part 1: The Basics
Omal Vindula
Omal Vindula

Following
19 min read
·
Nov 11, 2024
33







Photo by Markus Spiske on Unsplash
Next.js is the go-to framework for many developers when building React applications that need to be fast and scalable. But what makes it stand out? With built-in support for server-side rendering (SSR) and static site generation (SSG), Next.js helps you create web apps that load quickly, handle complex routing, and are easy to deploy. Plus, it makes working with reusable components and API routes straightforward — perfect for building interactive, user-friendly websites.

Now, if you’re creating a web app that requires user accounts or personalization, adding user login functionality is key. It’s what lets users sign in, access exclusive features, and enjoy a more tailored experience. Plus, login systems keep user data secure, improve engagement, and ensure your app meets privacy standards.

In this beginner-friendly guide, we’ll walk through how to set up user login in your Next.js app using Auth.js, a simple way to handle authentication. You’ll learn how to connect your app to an OpenID Connect-based Identity Provider (IdP) such as Asgardeo and apply best practices to keep your users’ data safe.

I previously wrote a guide on this topic back in 2023, but a lot has changed since then. This updated guide will cover the latest practices and improvements to help you build an even better authentication system. Let’s dive in and make your Next.js app secure and user-friendly!

If you’d like to skip the guide and explore the sample application right away, you can check out this Next.js sample app repository that includes the necessary boilerplate and step-by-step folders you can check out in each step as we go along.

Step 1: Create Your Next.js App
First things first, let’s create a simple Next.js app. Open your terminal, pick a folder where you want your project, and run this command:

npx create-next-app@latest --typescript nextjs-auth-demo
Note: We’re using TypeScript here, but if you’re more comfortable with JavaScript, just replace --typescript with --javascript.

When you run this command, you’ll get some setup prompts. Go with the default options to keep it simple. Once it’s done, you’ll see a new folder called nextjs-auth-demo in your project directory.


Navigate into your new project and start the development server:

cd nextjs-auth-demo
npm run dev
If everything worked, your Next.js starter page should be up and running at http://localhost:3000.


At this point, you have a fully functional Next.js app. For this guide, we will be using the Auth.js library, which provides a simple and secure way to handle authentication in Next.js apps.

Why Use Auth.js?
When integrating Asgardeo with your Next.js app, using a library like Auth.js offers significant benefits over building a custom SDK.

No Vendor Lock-in: One of the most significant advantages of using Auth.js is its flexibility to integrate with various Identity Providers (IdPs), not just Asgardeo. While it provides seamless support for OIDC with Asgardeo, you’re not restricted to this provider. If you ever decide to switch to a different IdP in the future (such as Auth0, Google, or AWS Cognito), Auth.js can easily be configured to support these without requiring you to rebuild your entire authentication system. This avoids vendor lock-in and future-proofs your application, giving you the freedom to choose the best provider for your evolving needs.
Simplified, Secure Authentication: Auth.js simplifies the implementation of complex authentication flows like token validation, session management, and token refresh, allowing you to handle these processes securely with minimal code. Instead of building your own custom SDK — where you’d need deep knowledge of OIDC protocols and their security nuances — Auth.js provides pre-built solutions, ensuring you don’t expose your app to vulnerabilities like improper token handling. This results in a more robust, scalable, and maintainable authentication layer.
Community Support and Documentation: Auth.js has an active community and comprehensive documentation. If you encounter any issues or need to extend functionality, there are plenty of resources available. This ecosystem of support can save you from troubleshooting alone or having to build out your own documentation for a custom SDK.
So far, you have created a sample Next.js app. Next, let’s see how to integrate login functionality into our Next.js application.

Step 2: Register your application in Asgardeo
To integrate your application with Asgardeo, you first need to create an organization in Asgardeo and register your application as a single-page application.

Sign up for a free Asgardeo account at wso2.com/asgardeo.
Sign in to the Asgardeo console and navigate to Applications > New Application.
Select Traditional Web Application from the template list.

4. Choose OpenID Connect (OIDC) as the protocol and complete the wizard popup by providing a suitable name and an authorized redirect URL.

Note: The authorized redirect URL determines where Asgardeo should send users after they successfully log in. For this guide, we’ll use http://localhost:3000/api/auth/callback/asgardeo, as the sample application will be accessible at this URL.


5. Complete the wizard popup by providing a suitable name and an authorized redirect URL

Once you create the application, you will be directed to the Quick Start tab of the created application, which will guide you to integrate login into your application using various technologies like Next.js, Node.js, and .NET.

Hint: Use the information available in the Quick Start tab of your app to configure Auth.js for the sample app.

Step 3: Integrating Auth.js for Next.js Authentication
For this guide, we’ll be using version 5 of Auth.js, which is the latest at the time of writing. Open your terminal, navigate to the root of your project, and run:

npm install next-auth@beta
Generate the Auth Secret Environment Variable
One environment variable you must set up is AUTH_SECRET. This is a random value that Auth.js uses to encrypt tokens and email verification hashes. Don’t worry; you don’t need to come up with this on your own. Just run:

npx auth secret
This command will generate a secret and add it directly to your .env file.

Set Up Environment Variables
Next, grab the Client ID and Client Secret from the Quick Start tab of your Asgardeo app. Add these to your .env or .env.local file. Remember, the Client Secret is sensitive information, so keep it in an environment variable or use secure storage.

Your .env.local file should look like this:

/.env.local

AUTH_SECRET={GENERATED_SECRET}
AUTH_ASGARDEO_ID={CLIENT_ID}
AUTH_ASGARDEO_SECRET={CLIENT_SECRET}
You’ll also need the issuer URL, which you can find in the Info tab of your Asgardeo application. Add it like this:

AUTH_ASGARDEO_ISSUER="https://api.asgardeo.io/t/{ORG_NAME}/oauth2/token"
Create the Auth.js Configuration File
Now it’s time to create a configuration file for Auth.js. This is where you’ll define how the library behaves, set up custom authentication logic, and include other options like token handling.

Create a new file called auth.ts in the src directory and add the following content:

/src/auth.ts

import NextAuth from "next-auth"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
})
Add a Route Handler
Create a route handler by adding the following in src/app/api/auth/[...nextauth]/route.ts:

/src/app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/auth"; // This refers to the auth.ts file we just created
export const { GET, POST } = handlers;
Optional Middleware to Keep the Session Alive
If you want to keep the user session active and update its expiry every time it’s used, add a middleware file. Create src/middleware.ts with this content:

/src/middleware.ts

export { auth as middleware } from "@/auth";
Step 4: Add Asgardeo as a Provider in Auth.js Configuration
Now we’re ready to add Asgardeo as a provider in src/auth.ts. Auth.js comes with over 80 pre-configured providers, including Asgardeo, which makes the setup super easy.


Update src/auth.ts with:

/src/auth.ts

import NextAuth from "next-auth"
import Asgardeo from "next-auth/providers/asgardeo"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Asgardeo({
    issuer: process.env.AUTH_ASGARDEO_ISSUER
  })],
})
Note: We’re only passing the issuer from the environment variables to the Asgardeo() function. The Client ID and Client Secret are automatically picked up by Auth.js, so you don’t need to include them in the provider configuration.

And that’s it! You’ve now set up Auth.js and added Asgardeo as your authentication provider. Next, we’ll look at adding different functionalities like log in, session management and log out.

Step 5: Implement Login Functionality
Now that we’ve set up Auth.js, let’s add login feature to the Next.js app. We’ll use the auth() hook from Auth.js to access authentication data like the logged-in user's info and methods for managing authentication status. Auth.js comes with built-in methods like signIn() and signOut() that make handling user sessions easy.

First, let’s update page.tsx so users can log in with a button click. Here’s how:

/src/app/page.tsx

import { signIn } from "@/auth"

export default async function Home() {

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col">
            <form
              action={async () => {
                "use server"
                await signIn("asgardeo")
              }}
            >
              <button
                className="rounded-full border border-solid border-transparent flex items-center justify-center bg-foreground text-background text-lg h-10 px-4"
                type="submit"
              >
                Sign in
              </button>
            </form>
        </div>
      </main>
    </div>
  );
}
What This Code Does
The <form> component above creates a simple login button that triggers the signIn() function from Auth.js when clicked. This function redirects the user to the Asgardeo login page, and once they successfully log in, they’ll be redirected back to the app with their session established. If all goes well, your application should look like this:


Our application so far… See the Sign In button appears in the UI!
Testing the Login
To see this in action, click the Sign in button in your app. You’ll notice an OIDC (OpenID Connect) request in your browser’s dev tools under the Network tab. Look for a request named authorize after clicking Sign in.


/authorize request

Upon clicking on Sign in, the application will redirect to Asgardeo login page
Verifying the User Session
Once the user logs in, it’s important to check their session status. You can do this using the auth() function on the server side. Let’s update page.tsx to display different content based on whether the user is logged in.

/src/app/page.tsx

import { auth, signIn, signOut } from "@/auth"

export default async function Home() {
  const session = await auth();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col">
          {
            !session ? (
              <form
                action={async () => {
                  "use server"
                  await signIn("asgardeo")
                }}
              >
                <button
                  className="rounded-full border border-solid border-transparent flex items-center justify-center bg-foreground text-background text-lg h-10 px-4"
                  type="submit"
                >
                  Sign in
                </button>
              </form>
            ) : (
              <>
                <p className="text-center mb-3">
                  You are now signed in!
                </p>
                <pre>{JSON.stringify(session, null, 2)}</pre>
                <form
                  action={async () => {
                    "use server"
                    await signOut()
                  }}
                >
                  <button
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center text-lg h-10 px-4"
                    type="submit"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            )
          }
        </div>
      </main>
    </div>
  );
}
What This Code Does
This updated page.tsx file checks the user’s session using auth(). If the user isn’t logged in (it will not contain a session object), it shows the Sign in button. If the user is logged in (it will contain a session object), it displays a message and the session details, along with a Sign Out button.

Step 6.1: Accessing the Session Information (Server-Side)
Once logged in, the session object will appear in the UI, but it might not have all the data you need. Let’s enhance this using Auth.js callbacks.

Using Callbacks to Retrieve User Info
Auth.js comes with several callback functions, such as jwt, signIn, and session. These callbacks can run custom logic when triggered. We’ll use the jwt callback to extract user data from the ID token and pass it to the session.

Here’s how you can use the jwt callback in Next.js to handle user information:

/src/auth.ts

import NextAuth from "next-auth"
import Asgardeo from "next-auth/providers/asgardeo"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Asgardeo({
    issuer: process.env.AUTH_ASGARDEO_ISSUER
  })],
  callbacks: {
    async jwt({ token, profile }) {      
      if (profile) {
        token.email = profile.username
      }

      return token;
    }
  }
})
What’s Happening Here
The jwt callback extracts the user’s email from the profile object (decoded ID token) and attaches it to the token object. This token is then used by the session callback.

Profile Object (decoded ID token): Contains user details like username.
Token Object: Used to pass data to the session callback.
// profile object
// This will return the decoded ID token of the authenticated user
{
  isk: '4245c82...',
  at_hash: 'dEKHH_XXXX-7wZ2dXPq8fw',
  sub: '88a2a909-xxxx-xxxx-xxxx-70c5205f0960',
  amr: [ 'BasicAuthenticator' ],
  iss: 'https://api.asgardeo.io/t/animetrix/oauth2/token',
  sid: '9e8dae50-xxxx-xxxx-xxxx-be86064a2c25',
  aud: '4tydjEAUOw_XXXX_7_YhjCdAa',
  c_hash: 'rhLbBk--3tFo3TvXXXX',
  nbf: 1727870958,
  azp: '4tydjEAUOw_XXXX_7_YhjCdAa',
  org_id: 'd48dac9e-xxxx-xxx-xxx-bc801b833904',
  exp: 1727874558,
  org_name: 'animetrix',
  iat: 1727870958,
  jti: '31847675-xxxx-xxxx-xxxx-184467825755',
  username: 'omalvindula@live.com'
}
// token object
// Using this token object, we are passing data to the session callback
{
  name: undefined,
  email: undefined,
  picture: undefined,
  sub: '98303ae3-xxxx-xxxx-xxxx-76c4214247cc'
}
Once this user information is returned from the jwt callback, we need to pass this data to the session object of the auth() function. To do that, we will be using the session callback as follows:

/src/auth.ts

import NextAuth from "next-auth"
import Asgardeo from "next-auth/providers/asgardeo"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Asgardeo({
    issuer: process.env.AUTH_ASGARDEO_ISSUER
  })],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.username = profile.username
      }

      return token;
    },
    async session({ session, token }) {      
      // Adding the username from the token to the session object so it's available session data
      if (token) {
        session.user.email = token.username as string;
      }

      return session;
    }
  }
})
This setup will ensure that user information from the ID token gets passed into the session data shown in your app. So when a user is logged in, they will have the following values:

// session object
{
  user: { name: undefined, email: undefined, image: undefined },
  expires: '2024-11-01T12:28:07.124Z'
}
// token object
// Notice that username is now availble in the token object
{
  sub: '98303ae3-54d9-4b70-8347-76c4214247cc',
  username: 'omalvindula@live.com',
  iat: 1727872087,
  exp: 1730464087,
  jti: '6a8e2920-34ee-4425-bf4f-c966718dd6f9'
}
By combining the values in session and token objects, the following data will be returned as the session object from the auth() function.

{
  "user": {
    "email": "omalvindula@live.com"
  },
  "expires": "2024-11-01T12:28:07.101Z"
}
Once logged in, you can see that the session object is now containing the email address of the logged-in user in the application UI:


Voila! Session data can be seen now from the UI
By default, Asgardeo will only send the username in the ID token. But this can be configured in the Asgardeo console to send any user attribute in the ID token and then that will be available in the profile object.

Access Additional User Information
Want to show the user’s first and last name? Configure your Asgardeo app to send these attributes:

Log in to the console and go to the application settings of the application we created.
Then go to the User Attributes tab and check the First Name (given_name) and Last Name (family_name) under the Profile attribute.
Save application settings.

Check the User Attributes you want to send in the ID token
This will tell Asgardeo to send the checked attributes under the profile scope. Once these attributes are sent from Asgardeo, we need to change the src/auth.ts file to receive these data by changing the callbacks as follows:

/src/auth.ts

import NextAuth from "next-auth"
import Asgardeo from "next-auth/providers/asgardeo"

declare module "next-auth" {
  interface User {
    given_name?: string;
    family_name?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Asgardeo({
    issuer: process.env.AUTH_ASGARDEO_ISSUER
  })],
  callbacks: {
    async jwt({ token, profile }) {
      
      if (profile) {
        token.username = profile.username;
        token.given_name = profile.given_name;
        token.family_name = profile.family_name;
      }

      return token;
    },
    async session({ session, token }) {            
      // Adding the username from the token to the session object so it's available session data
      if (token) {
        session.user.email = token.username as string;
        session.user.given_name = token.given_name as string;
        session.user.family_name = token.family_name as string;
      }

      return session;
    }
  }
})
Note: Since we are adding new information to the user object inside the session object (which is having the interface — User), note that we also have to update the interface to contain this new information.

Once the configuration is done, we have to re-login to the application to see these changes. When you’re logging in, Asgardeo will prompt a consent screen (only prompts once) since you need to give permission for this application to access these values of the user.


Consent Page
Once we have given consent and logged into the application, we can see that the profile information (including first and last name) will be available in the session object of the auth() function as shown below:


Note: If you don’t get any value for given_name and family_name, it might be because you have not added these values when creating the user in Asgardeo. You can add these values either using the Asgardeo console or logging into the My Account of that particular user.

Step 6.2: Accessing the Session Information from the Client-Side
Previously, we used session data on the server side to get user information through the auth() function from Auth.js. But what if we want to do the same on the client side? In Next.js, having both client and server components handle authentication is important for securing your app. Let’s walk through how to set this up.

The approach is similar to what we did on the server side. To show you how this works, we’ll create a simple user profile component.

Create a Profile Page Component
Start by making a new file called /src/app/profile/page.tsx and add the following code:

/src/app/profile/page.tsx

export default function Profile() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <span>Profile Page</span>
    </div>
  );
}
Now, if you visit http://localhost:3000/profile, you’ll see a basic “Profile Page” displayed.


Using useSession() Hook on the Client-Side
To get session information on the client side, use the useSession() hook from Auth.js:

/src/app/profile/page.tsx

"use client";

import { SignOutButton } from "@/components/sign-out-button";
import { useSession } from "next-auth/react";

export default function Profile() {
    const { data: session } = useSession()

    if (!session) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <h1>You need to sign in to view this page</h1>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            <h1 className="mb-5">Profile Page</h1>
            <p>Email : {session?.user?.email}</p>
            <p>First Name : {session?.user?.given_name}</p>
            <p>Last Name : {session?.user?.family_name}</p>
            <div className="mt-5">
                <SignOutButton />
            </div>
        </div>
    );
}
What’s Happening Here
In this code, we import useSession() from next-auth/react and check if there’s an active session. If there isn’t one, we display a message prompting the user to sign in. If a session exists, we show the user's email, first name, and last name, along with a Sign Out button.

Wrapping Your App with <SessionProvider />
For the useSession() hook to work, your entire application needs to be wrapped with <SessionProvider/> from Auth.js. This is done in the root layout component.

/src/app/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
Note: If you already added <SessionProvider /> in page.tsx earlier, you can remove it now, as it’s not needed there anymore.

Testing Your Profile Page
Now, if a user is logged in and visits http://localhost:3000/profile, they should see their profile details displayed. If they’re not logged in, they’ll see the prompt to sign in.


Profile page when a user is signed in

Profile page when a user is NOT signed in
This setup ensures that your Next.js app can access user session data from both the client and server sides, providing a more secure and dynamic user experience.

Step 7: Implement Logout Functionality
Now we have an app that lets users log in and view their profile information. When you click the Sign Out button, the user should be redirected to the login page. But there’s a catch: while it may look like the logout is working, it actually isn’t clearing the session fully. You’ll notice that clicking Sign In again doesn’t prompt you for your credentials. That’s because the signOut() function in Auth.js only clears the client-side session. This is expected behaviour, as noted in their documentation. Ideally, we want to log the user out from Asgardeo (IdP) as well, and the good news is we can do this easily.

Configuring the Asgardeo Logout Endpoint URL
You can find the logout endpoint in the Asgardeo Console under the Info tab in the application settings. This endpoint needs the following query parameters:

id_token_hint — The user’s ID token.
post_logout_redirect_uri — The URL to redirect the user after logging out.
Note: Make sure to add the post_logout_redirect_uri as an authorized redirect URL in the Asgardeo console.

Expose the ID Token in Your App
To access the ID token, we need to tweak the callbacks in /src/auth.ts:

/src/auth.ts

import NextAuth from "next-auth"
import Asgardeo from "next-auth/providers/asgardeo"

declare module "next-auth" {
  interface User {
    given_name?: string;
    family_name?: string;
    id_token?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Asgardeo({
    issuer: process.env.AUTH_ASGARDEO_ISSUER
  })],
  callbacks: {
    async jwt({ token, profile, account }) {      
      if (profile) {
        token.username = profile.username;
        token.given_name = profile.given_name;
        token.family_name = profile.family_name;
      }

      if (account) {
        token.id_token = account.id_token;        
      }

      return token;
    },
    async session({ session, token }) {            
      if (token) {
        session.user.email = token.username as string;
        session.user.given_name = token.given_name as string;
        session.user.family_name = token.family_name as string;
        session.user.id_token = token.id_token as string;
      }

      return session;
    }
  }
})
Here, we extract the id_token from the account object in the jwt callback and pass it to the token object, which then gets added to the session.

Create a Custom Sign-Out Button
Now let’s create a custom sign-out button component in /src/components/sign-out-button.tsx to handle the Asgardeo logout:

/src/components/sign-out-button.tsx

"use client";

import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react";

export const SignOutButton = () => {
  const { data: session } = useSession()

  const handleLogout = () => {
    if (session?.user?.id_token) {
      // Since next-auth does not support OIDC logout, we have to manually call the OIDC logout endpoint.
      window.location.assign(
        process.env.NEXT_PUBLIC_AUTH_ASGARDEO_LOGOUT_URL +
        "?id_token_hint=" + session?.user?.id_token +
        "&post_logout_redirect_uri=" + process.env.NEXT_PUBLIC_AUTH_ASGARDEO_POST_LOGOUT_REDIRECT_URL
      )
    } else {
      signOut();
    }
  }

  return (
    <button
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center text-lg h-10 px-4"
      onClick={handleLogout}
    >
      Sign Out
    </button>
  );
};
Note: The "use client" directive tells Next.js that this component should run on the client side since it includes browser interactions like window.location.assign. By default, Next.js components are server-side rendered, so adding "use client" ensures client-side execution.

Environment Variables
For this custom signout logic to work, you will need to configure the following environment variables in your .env.local file.

/.env.local

.
.
.
NEXT_PUBLIC_AUTH_ASGARDEO_LOGOUT_URL="https://api.asgardeo.io/t/{org_name}/oidc/logout"
NEXT_PUBLIC_AUTH_ASGARDEO_POST_LOGOUT_REDIRECT_URL="http://localhost:3000/auth/sign-out"
Note: The NEXT_PUBLIC_ prefix is important to expose these variables to the client-side component.

Handle Post-Logout Actions
We need a component to handle the redirect after logout. Create /src/app/auth/sign-out/page.tsx:

/src/app/auth/sign-out/page.tsx

"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      router.push("/");
    });
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <span>Signing Out...</span>
    </div>
  );
}
Note that the path of this component matches the URL in the post-logout URL: /src/app/auth/sign-out/page.tsx. Upon successful logout, the application will load this component and the component will call the client-side signOut() function of the Auth.js and then will redirect to the root (“/”) of the application upon successful completion.

Update the Home Page
Now, let’s update page.tsx to include the new <SignOutButton />:

/src/app/page.tsx

import { auth, signIn } from "@/auth"
import { SignOutButton } from "@/components/sign-out-button";
import { SessionProvider } from "next-auth/react";

export default async function Home() {
  const session = await auth();

  return (
    <SessionProvider>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="flex gap-4 items-center flex-col">
            {
              !session ? (
                <form
                  action={async () => {
                    "use server"
                    await signIn("asgardeo")
                  }}
                >
                  <button
                    className="rounded-full border border-solid border-transparent flex items-center justify-center bg-foreground text-background text-lg h-10 px-4"
                    type="submit"
                  >
                    Sign in
                  </button>
                </form>
              ) : (
                <>
                  <p className="text-center mb-3">
                    Welcome, { `${session?.user?.given_name} ${session?.user?.family_name}` }
                  </p>
                  <SignOutButton />
                </>
              )
            }
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
Note: Wrapping your app in <SessionProvider> ensures the session is shared across your application, allowing you to use hooks like useSession() anywhere. If you added <SessionProvider> to page.tsx earlier, you can remove it.

Testing the Logout
Try logging out and logging back in to verify that the session is properly cleared both on the client and from Asgardeo. You should be prompted for your credentials every time you log back in, confirming the session has been fully logged out.

Conclusion
This wraps up Part 1 of our series on securing your Next.js app with Asgardeo and Auth.js. We covered setting up authentication, implementing login and logout functionality, and ensuring that sessions are fully managed. In upcoming parts, we’ll dive into securing routes, accessing protected APIs, adding theming, and exploring other advanced features. Stay tuned!