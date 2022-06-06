@Title = amplify
@Author = Connor Slade
@Date = 06-04-22
@Description = The creation and function of amplify
@Tags = amplify, docker, web app
@Path = programming/amplify
@Assets = .

---

# 🪗 amplify

so what is this 'amplify' thing?
well im very glad you asked,,,

amplify is kinda like advent of code but for the 17 days in June before school ends for me.
Every day a new challenge opens and you have to write some code to solve it.
The concept is simple, the execution - welllll ill get into it.

<div ad info>

You can try it out here: [amplify.connorcode.com](https://amplify.connorcode.com)

</div>

## 💡 The Idea

On May 13th I got the idea to mix [code.golf](https://code.golf) with [Advent of Code](https://adventofcode.com/) where you would get a new problem every day.
But instead of returning a signal number as your solution to the website you would write your code in it.
It will also generate the test cases based off of user IDs for added unnecessary complexity.

## 🌱 The Plan

### Authentication

So up to this point any of my web apps that needed user accounts just used basic username-password authentication, but for this one I wanted to use GitHub OAuth.
Once you log in you would see a page showing all the problems you have completed and are available to compete.
Opening a problem beings you to a page with the story / prompt for the problem, a text editor and stderr + stdout displays.

### Code Execuion

Clicking run would send the code to the backend server which would use a docker container to safely compile and execute your code.
Thare would also be a timeout to keep infinate loops from halting the whole system.
It would then compare your output to the expected output for the problem with your seed.

### Misc

At this point I dident really have any idea about the UI.
But I had started making a list of problem ideas:

```
 1. Simple Math
 2. Increase Count
 3. Interprate Words (up down ect) to a xy pos
 4. Max bracket {} depth
 5. Sierpiński triangle
 6. Tic Tak Toe Win Checker
 7. Html Tag Valadator
 8. URL Decode
 9. Duration Parser
10. Nth prime number
11. Readable Duration
12. Rule 30
13. Base 64 decode
14. BrainF Runner
15. Conways Game of life to n steps
16. Order Of Ops [less simple math]
17. Scale of 1-10 how good is rust
```

## 📀 The Implementation

For this applacation I used the following stack:

- afire - Web server framework
- apline.js - Lite frontend framework
- tailwind - Styleing
- sqlite3 - Database

### Authentication

In the begining I was having alot of truble understanding how OAuth auth is ment to work.
I eventually started to understand and made the follwing api routes: Redirect, Complete and Logout.

To login you just request the `/auth/redirect` path which is defnied like below.
It returns a redirect to the github oauth path with the client id and genarated state.

<details>
<summary>Code</summary>

```rust
server.route(Method::GET, "/auth/redirect", move |_| {
    let state = rand_str(10);

    app.oauth_state
        .lock()
        .push((state.clone(), current_epoch()));

    Response::new().status(308).header(
        "Location",
        &format!(
            "https://github.com/login/oauth/authorize?client_id={}&state={}",
            app.cfg.github_app_id, state
        ),
    )
});
```
</details>

Github then sends you to `/auth/complete` once its done.
THis route starts by getting the code and state from the github response.
It then verfies the state and gets the user access token from github whitch is them used to get some basic user info like name, id and avatar.
This data is then saved to the database in the users table.

And finally logging out just deleted your session from the database and removes your session cookie.

### Code Execuion

### Problems

### The UI

### Misc

## 🐍 Hosting

## 🌰 Challenges

## 📝 Conclusion
