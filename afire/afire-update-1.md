@Title = afire Update (V0.4.0)
@Author = Connor Slade
@Date = 02-19-21
@Description = Changes to afire in V0.4.0
@Tags = afire, afire v0.4.0, afire update
@Path = afire/update-1
@Assets = .

---

# 🔥 afire v0.4.0

[afire](crates.io/crates/afire) `V0.4.0` has some big changes.
Many of which break compatibility with the previous version, so make sure to read to the end.

> Full changelog can be found on GitHub [here](https://github.com/Basicprogrammer10/afire/blob/0.4.0/Changelog.md).

## ⛓ Changes

### Removed Deprecated Functions

The following functions have been removed from afire.
They have all been deprecated for at least one version.

| Item                | Deprecation Version |
| ------------------- | ------------------- |
| `Server::all`       | 0.3.0               |
| `Server::any`       | 0.1.5               |
| `Server::ip_string` | 0.3.0               |

### Header Changes

The [`Response::header`](https://docs.rs/afire/latest/afire/struct.Response.html#method.header) and
[`Server::default_header`](https://docs.rs/afire/latest/afire/struct.Server.html#method.default_header)
methods now takes a key and value as apposed to taking in a Header Struct.
This is kinda a big change as headers are set for almost every response.
I was debating making this change, but I think it's bettor to do it now than to wait for a later version.

```rust
.header("Key", "Value"); // New

.header(Header::new("Key", "Value")); // Old
```

So here is an easy way to update your codebase to the new header syntax.
This regex will remove the [`Header::new`](https://docs.rs/afire/latest/afire/struct.Header.html#method.new)
call from all header and default_header statements.
Use with caution of course :P

```
Replace: \.(default_header|header)\(Header::new\((.*)\)\)
With   : .$1($2)
```

### Closures!

As of afire `0.2.1` functions for making routes and setting the error handler have had closure variants.
For example, there was `Server::route` and `Server::route_c`.
Like just yesterday, I learned that functions could have the functions take in both by accepting `impl Fn(Request) -> Response`.
So the closure variants have been removed. Updating this is really easy, just remove the `_c` and the `Box::new`.

```rust
.route(Method::GET, "/", |req| ...); // New

.route_c(Method::GET, "/", Box::new(|req| ...)); // Old
```

### Route Path Types

This is a relatively small change. Before when creating routes you could use any displayable type (Implementing [`fmt::Display`](https://doc.rust-lang.org/std/fmt/trait.Display.html)).
This has been changed to taking in types implementing [`AsRef<str>`](https://doc.rust-lang.org/std/convert/trait.AsRef.html).

I made this change because it really doesn't make sense to be able to use random structs as a path.
I've only ever used [`&str`][&str]s for making paths, but I can see when using [`Strings`][string] would be useful.
This change really should not require any changes in your code base.

## 🗽 New Features

### Middleware Error Handling

So now onto the most exciting change!
In all previous versions of afire, if you panicked in the context of middleware, it would crash the whole thread and server.
But now the `panic_handler` feature has been extended to middleware!

The panic handler for routes and middleware has also been updated to support [`String`][string]s and [`&str`][&str]s in the message.
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
It should now work just fine.

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
And here is the paste handler:

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

[&str]: https://doc.rust-lang.org/std/str/
[string]: https://doc.rust-lang.org/std/string/struct.String.html
