@Title = My Stack
@Author = Connor Slade
@Date = 01-15-21
@Description = Tools I use to create Websites / Software
@Tags = Stack, Tools, Tech
@Path = other/stack
@Assets = .

---

# 📜 My Stack

Tools and extensions I use for creating websites and other programs.
I'm leaving out anything too obvious like HTML, or JS.

The <i class="fa fa-code"></i> icon specifies _Open Source_ software.

## Tools

#### Atom [<sup><i class="fa fa-code"></i></sup>](https://github.com/atom/atom)

<img src="../assets/other/my-stack/atom.png" width="150" alt="Atom Logo"></img>

[Atom](https://atom.io/) is the text editor _for the 21st Century_.
I use it for almost all of my text editing needs.
The startup time may be a bit slow as it is an election app but one it starts it's more than fast enough.
The advanced configuration is super easy because you can just style the UI with CSS.
I use the following community packages as well.

- [ide-rust](https://atom.io/packages/ide-rust)
- [atom-beautify](https://atom.io/packages/atom-beautify)
- [linter-eslist](https://atom.io/packages/atom-beautify)
- [logo-file-icons](https://atom.io/packages/logo-file-icons)
- [minimap](https://atom.io/packages/minimap)
- [prettier-atom](https://atom.io/packages/prettier-atom)
- [pigments](https://atom.io/packages/pigments)

#### Insomnia [<sup><i class="fa fa-code"></i></sup>](https://github.com/Kong/insomnia)

<img src="../assets/other/my-stack/insomnia.png" width="150" alt="Insomnia Logo"></img>

[Insomnia](https://insomnia.rest/) is a spectacular HTTP client for testing APIs.
It has support for REST, SOAP, GraphQL, and GRPC.
It has been a crucial part of development for this website and [afire](https://crates.io/crates/afire) my rust web server framework.

#### Alacritty [<sup><i class="fa fa-code"></i></sup>](https://github.com/alacritty/alacritty)

<img src="../assets/other/my-stack/alacritty.png" width="150" alt="Alacritty Logo"></img>

[Alacritty](https://github.com/alacritty/alacritty) is an incredibly performant hardware accelerated terminal emulator.
It's also written in rust, so it may get some bonus points :P

#### Firefox [<sup><i class="fa fa-code"></i></sup>](https://hg.mozilla.org/mozilla-central/)

<img src="../assets/other/my-stack/firefox.png" width="150" alt="Firefox Logo"></img>

[Firefox](https://www.mozilla.org/en-US/firefox/) is my preferred browser for multiple reasons.
This includes being open source, having great developer tools, and a great extension support.
Here are the main extensions I use:

| Extension                                                                                                     | Description                                                                                   |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [uBlock Origin](https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/)                                | User-friendly content blocker. Out of the box it blocks ads, trackers, coin miners and popups |
| [Terms of Service; Didn’t Read](https://addons.mozilla.org/en-US/firefox/addon/terms-of-service-didnt-read/)  | Give services a privacy grade and summarize the Terms of Service                              |
| [SponsorBlock](https://addons.mozilla.org/en-US/firefox/addon/sponsorblock/)                                  | Skip sponsored segments in YouTube videos                                                     |
| [Return Youtube Dislike](https://addons.mozilla.org/en-US/firefox/addon/return-youtube-dislikes/)             | Use past API data and estimations to bring back YouTube dislikes                              |
| [User-Agent Switcher and Manager](https://addons.mozilla.org/en-US/firefox/addon/user-agent-string-switcher/) | Easy way to change your User-Agent string                                                     |
| [Material Icons for Github](https://addons.mozilla.org/en-US/firefox/addon/material-icons-for-github/)        | Add really nice material icons to files shown in GitHub                                       |
| [Decentraleyes](https://addons.mozilla.org/en-US/firefox/addon/decentraleyes/)                                | Intercept requests for common libraries and serve them locally                                |
| [Bitwarden](https://addons.mozilla.org/en-US/firefox/addon/bitwarden-password-manager/)                       | Easy to get started with Password Manager                                                     |
| [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)                                  | User script Manager and runner                                                                |
| [uMatrix](https://addons.mozilla.org/en-US/firefox/addon/umatrix/)                                            | Advanced privacy focused matrix based firewall                                                |
| [Tree Tabs](https://addons.mozilla.org/en-US/firefox/addon/tree-tabs/)                                        | Organize your tabs in a nested tree like view                                                 |

---

## Stack

#### Rust [<sup><i class="fa fa-code"></i></sup>](https://github.com/rust-lang/rust)

<img src="../assets/other/my-stack/rust.svg" width="150" alt="Rust-Lang Logo"></img>

[Rust](https://www.rust-lang.org/) is a performant, reliable and safe modern programming language.
I have used it in all of my recent projects, including this website! The spectacular tooling, comprehensive standard library, and open package ecosystem gives rust a really great developer experience.
The rust libraries do still need time to mature for it to become more prevalent in [Game Development](https://arewegameyet.rs), [Machine Learning](https://www.arewelearningyet.com/) and other fields.
If you want to get started with rust I would recommend reading [The Rust Book](https://doc.rust-lang.org/stable/book/), which is a free online book outlining everything from setting up your environment to building your own simple web server!

#### afire [<sup><i class="fa fa-code"></i></sup>](github.com/basicprogrammer10/afire)

<img src="../assets/other/my-stack/afire.png" width="150" alt="afire Logo"></img>

[afire](https://crates.io/crates/afire) is my dependency free web server framework.
I made it with rust over the course of a month and have been adding to it since then!
It has support for all the things necessary for a capable webserver framework,
Routes, Middleware, Path Parameters, Path Queries, Cookies and more. Below is a simple example server made with afire `v0.3.0`.

```rust
// Import Lib
use afire::{Server, Method, Response, Header, Content};

// Create Server
let mut server: Server = Server::new("localhost", 8080);

// Add a route
server.route(Method::GET, "/greet/{name}", |req| {
  let name = req.path_param("name").unwrap();

  Response::new()
    .text(format!("Hello, {}", name))
    .content(Content::TXT)
});

// Start the server
// This is blocking
server.start().unwrap();
```

#### Sass [<sup><i class="fa fa-code"></i></sup>](https://github.com/sass/dart-sass)

<img src="../assets/other/my-stack/sass.svg" width="150" alt="Sass Logo"></img>

[Sass](https://sass-lang.com/) or Syntactically Awesome Style Sheets is a CSS preprocessor with an extended syntax. It compiles from .scss and .sass files to standard CSS.
With sass, you can use selector nesting, complied variables, loops, inheritance, mixins and import code from other files.
It is actively used by a very large community of people. Get started with sass by reading the official [guide](https://sass-lang.com/guide).
