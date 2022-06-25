@Title = afire Update (V1.2.0)
@Author = Connor Slade
@Date = 06-24-22
@Description = Updates to afire in V1.1.0
@Tags = afire, afire v1.2.0, afire update
@Path = afire/update-4
@Assets = .

---

# 🔥 afire v1.2.0

_damn its been a hot sec_

It's been over two months and 48 commits since the last afire release and I have some new and somewhat interesting features to show you!

<div ad info>
Info

As always, a full update changelog is on GitHub [here](https://github.com/Basicprogrammer10/afire/releases/tag/v1.2.0).

</div>

## 📰 New Features

### Server wide state

Now instead of passing around an Arc to all of your route definitions you can now use the built-in state system!
Let's look at a simple example to just count up with each request.

```rust
#[derive(Default)]
struct App {
    count: AtomicUsize,
}

fn main() {
  let mut server = Server::<App>::new("localhost", 8080).state(App::default());

  // Add a statefull catch all route that takes in state and the request
  server.stateful_route(Method::ANY, "**", |app, _req| {
      // Respond with and increment request count
      Response::new().text(app.count.fetch_add(1, Ordering::Relaxed))
  });

  // Start the server
  // This will block the current thread
  server.start().unwrap();
}
```

Because the state is defined with generics if you want to make an afire app without a state you will now have to make the server like this `Server::<()>::new(...)`.
I spent a lot of time thinking about if this was acceptable and eventually decided that it is a small price to pay for the convenience of a server wide state in bigger projects.

### Error Handling

The internal Error handling system got a total rewrite.
Errors can now be sent to the client on the occurrence of an error Parsing the HTTP message, handling the request or an IO error.
Instead of the old way of just falling back to default values.
This new error enum can be defined as such:

```rust
/// Errors that can occur,,,
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Error {
    /// Error while handling a Request
    Handle(Box<HandleError>),

    /// Error while parsing request HTTP
    Parse(ParseError),

    /// IO Errors
    Io(io::ErrorKind),

    /// Response does not exist (probably because of an error with the request)
    None,
}

/// Errors thet can arize while handling a request
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum HandleError {
    /// Route matching request path not found
    NotFound(Method, String),

    /// A route or middleware paniced while running
    Panic(Box<Result<Request>>, String),
}

/// Error that can occur while parsing the HTTP of a request
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ParseError {
    /// No `\r\n\r\n` found in request to separate metadata from body
    NoSeparator,

    /// No Method found in request HTTP
    NoMethod,

    /// No Path found in request HTTP
    NoPath,

    /// No Version found in request HTTP
    NoVersion,

    /// No Request Line found in HTTP
    NoRequestLine,

    /// Invalid Query in Path
    InvalidQuery,

    /// Invalid Header in Request HTTP
    InvalidHeader(usize),
}

```

In the case of a Parse or IO error afire will send a response informing the client of the error.
As in previous versions you can write your own handler to handle errors

### Request ID Middleware

A new extension has been added to afire: Request ID.
It just adds a header of a definable name to each incoming request with a number.
thats all,,, 🤷‍♂️ hey it could be useful.

### Cache Middleware

Another new extension was added to cache responses.
It stores the route paths with the response and uses this to allow for future requests to the same path and method within a timeout to be cached.
You can use the extension like this:

```rust
Cache::new()
 // Cache paths that start with `/cache`
 .to_cache(|req| req.path.starts_with("/cache"))
 // Disable timeout
 .timeout(0)
 .attach(&mut server);
```

## 📎 Changes

## Middleware Organization

In previous versions of afire there were specific features for every built-in extension.
This has been changed to have them all under the `extensions` feature.
And instead of using afire::ServeStatic to access one of the extensions you will use afire::extensions::ServeStatic.

## Middleware

In previous versions Middleware would take in plain Requests / Responses, now in an effort to reduce cloning the request references are used.
Because of the new error handling system outlined earlier the requests take in an afire::Result.

```rust
/* OLD */ fn pre(&self, req: Request) -> MiddleRequest
/* NEW */ fn pre(&self, req: &Result<Request>) -> MiddleRequest

/* OLD */ fn post(&self, req: Request, res: Response) -> MiddleResponse
/* NEW */ fn post(&self, req: &Result<Request>, res: &Result<Response>) -> MiddleResponse

/* OLD */ fn end(&self, req: Request, res: Response)
/* NEW */ fn end(&self, req: &Result<Request>, res: &Response)
```

In your middleware you can match the request, and if it is not Ok() then you can just Continue.
If you are feeling extra lazy you can just unwrap and leave your error handler to deal with it :p.

### Serve Static

The built-in ServeStatic extension got a bit of a cleanup and some new features!
One of which is that you can now set the serve path so static content is not just served on the root.
This could allow for serving static content from different places at multiple different web paths.

```rust
ServeStatic::new("data/static")
  // Set serve path
  .path("/static")
  // Attatch it to the afire server
  .attach(&mut server);
```

### MISC

Now a lot more functions are taking in `AsRef<str>` instead of `Display` because they are intended to take in strings not just any displayable type.

The Rate limit extension got a performance enhancement when running with thread pool.

Request parsing had gotten a performance boost and should now use less memory.

When afire is building the HTTP response it will not add the Content-Length or any default headers that are already present.

## 🗑 Removed Things

The `ignore_trailing_path_slash` feature was removed in favor or it always being active.

Removed the unhinged build script that I used for generating the README from the lib.rs doc comments.
Turns out that you can import files as doc comments: `#![doc = include_str!("../README.md")]`.

Removed the Request.raw_data field because it was about doubling the size of the Request instance.

Removed the Request::body_string function in favor of String::from_utf8() because it gives more control if you want to use the from_utf8_lossy,

## 😺 Conclusion

welp,,, thats all folks.

This update had a lot of good changes, hopefully I release version 1.3.0 next month.
Hopefully I get to adding socket keep alive support which would make it about as fast as actix, which would be really cool.
I'm also looking into data streaming for requests and responses so it doesn't need to load lots of data into memory to send it through the socket.
