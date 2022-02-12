@Title = afire Update (V0.3.1)
@Author = Connor Slade
@Date = 02-12-21
@Description = Changes to afire in V0.3.1
@Tags = afire, afire v0.3.1, afire update
@Path = afire/update-1
@Assets = .

---

# 🔥 afire v0.3.1

[afire](crates.io/crates/afire) `V0.3.1` only has a few new features, but they are huge!

> Full changelog can be found on GitHub [here](https://github.com/Basicprogrammer10/afire/blob/0.3.1/Changelog.md).

## 🗽 New Features

### Middleware Error Handling

Let's start with the most exciting change!
In all previous versions of afire, if you panicked in the context of middleware, it would crash the whole thread and server.
But now the `panic_handler` feature has been extended to middleware!

The panic handler for routes and middleware has also been updated to support `String`s and `&str`s in the message.
Unlike before, where it would only take `&str`s. Eventually this will be extended to all displayable types.

### Prelude

Often when making routes in afire you end up importing the same things.
The prelude imports the most commonly used parts of afire!
Below you can see the definition of the prelude and what it imports.

```rust
pub mod prelude {
    pub use crate::{
        middleware::{MiddleRequest, MiddleResponse, Middleware},
        Content, Header, Method, Response, Server,
    };
}
```

And now a quick example.

```rust
use afire::prelude::*;

fn main() {
    let mut server: Server = Server::new("localhost", 8080);

    server.route(Method::GET, "/", |_req| {
        Response::new()
            .text("Hi :P")
            .header(Header::new("Content-Type", "text/plain"))
    });

    server.start().unwrap();
}

```

### HTTP Parser

The HTTP parser got some upgrades in this version.
It's string based, so it could still be improved a lot.
I spent a lot of time optimizing the HTTP parser, only by a few hundred nanoseconds, but that time adds up.

Before, when parsing the headers, afire would return an `Internal Server Error` if there were non UTF-8 chars.
It should not work just fine.

I also added a lot more tests to afire as a whole, and especially the HTTP parser.
I found and fixed some bugs because if it :)

### MIME Types

When making my many projects in afire, I have sometimes needed to get the mime type of a file by its extension.
This has required embedding a look-up table into each project, like the one found in the serve static middleware.
Because of this, I made the embedded look up table public.
Just remember to use the `serve_static` feature. Here is an example usage:

```rust
use afire::serve_static::TYPES;

let a = "png";
let mime = TYPES.iter().find(|x| x.0 == a);

println!("Found Type: {}", mime.unwrap().1);
```

## 🩹 Fixes

As mentions before, I redid a lot of the raw HTTP parsing stuff.
I also worked on the stream handler, and fixed a bug with the content length.
Because of this, you can now upload files to afire servers.

I made use of this in my paste bin [Plaster Box](https://github.com/Basicprogrammer10/plaster-box).
And here is the new paste handler:

```rust
server.route(Method::POST, "/new", |req| {
    if req.body.len() > DATA_LIMIT {
        return Response::new().status(400).text("Data too big!");
    }

    let body_str = match req.body_string() {
        Some(i) => i,
        None => return Response::new().status(400).text("Invalid Text"),
    };

    let name = req
        .header("Name")
        .unwrap_or_else(|| "Untitled Box".to_owned());

    let uuid = Uuid::new_v4();
    let bin = Bin {
        uuid: *uuid.as_bytes(),
        name,
        data: body_str,
        time: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };

    DATA.write().unwrap().push(bin);

    Response::new().text(uuid)
});
```
