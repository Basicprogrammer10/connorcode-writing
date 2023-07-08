@Title = afire Update (V2.2.0)
@Author = Connor Slade
@Date = 07-06-23
@Description = Updates to afire in V2.2.0
@Tags = afire, afire v2.2.0, afire update
@Path = afire/update-7
@Assets = .

---

# 🔥 afire v2.2.0

afire `v2.2.0` was released July 2nd.
This update includes some minor enhancements and some new features.

<div ad info>
Info

As always, a full update changelog is on [here on Github](https://github.com/Basicprogrammer10/afire/releases/tag/v2.2.0).

You can also find the afire docs on [docs.rs here](https://docs.rs/afire/latest/afire).

</div>

## New Features

### Server Sent Events

Jumping right in with the _biggest_ change first: [Server-Sent Events][sse].
Before this update, I didn't even know what SSE was so ill give a quick rundown.
Its kinda like a simpler one-way Websocket, you can only send data from the server to the client (which is why it's _server-sent_ events).

So how do you use this new feature?
Here is a quick example:

```rust
// You start with just any old route
server.route(Method::GET, "/sse", |req| {
    // Then call .sse() on the request object
    // (from the afire::server_sent_events::ServerSentEventsExt trait)
    let stream = req.sse().unwrap();

    // You can now call stream.send(..)
    for i in 0..10 {
        stream.send("update", i.to_string());
        thread::sleep(Duration::from_secs(1));
    }

    // Close the connection without sending an HTTP response
    Response::end()
});
```

Then in the browser you can connect to the event stream with JavaScript using the [`EventSource`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) API:

```javascript
const events = new EventSource("/sse");
events.addEventListener("update", (event) => {
  console.log(event.data);
});
```

On the `ServerSentEventStream` there are 5 main methods:

```rust
/// Sends a new event with the given event type and data.
fn send(&self, event_type: impl AsRef<str>, data: impl Display);

/// Sends a new event with the given event type and id.
fn send_id(&self, event_type: impl AsRef<str>, id: u32, data: impl Display)

/// Sends a new event with an Event struct.
fn send_event(&self, event: Event)

/// Sets the retry interval in milliseconds.
/// Calling this will signal the client to try to reconnect after the given amount of milliseconds.
fn set_retry(&self, retry: u32)

/// Close the connection.
/// Note: Will block until the connection is closed.
fn close(&self)
```

### Logger with RealIp

When creating a `Logger` you can now call the `real_ip(..)` method and pass a HeaderType to get the real ip from.
This is useful if you are behind a reverse proxy and want to log the real ip of the client instead of the proxy address.
Just make sure your reverse proxy is overwriting the specified header on the incoming requests so clients cant spoof their original Ips.

Example:

```rust
Logger::new()
    .real_ip(HeaderType::XForwardedFor)
    .file("example.log")
    .unwrap()
    .attach(&mut server);
```

### ServeStatic supports '..'

Now, instead of just ignoring '..' in paths, it will now go up a directory.
Note: The highest you can go is the data directory that you define, so there is no path traversal vulnerability.

```
== OLD ==
GET /static/../../etc/passwd -> GET /static/etc/passwd

== NEW ==
GET /static/../../etc/passwd -> GET /etc/passwd
```

### HEAD Middleware

A new middleware has been added to support the [HTTP `HEAD` method][head], which is used to get the headers of a response without getting the body (for GET requests only).
It does this by changing the method to GET and adding a special header (`afire::head`).
Once the response is processed by the normal route handler, the middleware will check if the header is present.
If there is any body data, it will be discarded and the Content-Length header will be added, if it is not already present.
On static responses, the length is already known, but with streaming responses, the stream will be read to the end to get the length by default.

Using this middleware is very simple:

```rust
let mut server = Server::new("localhost", 8080);
Head::new().streaming(false).attach(&mut server);
```

### TRACE Middleware

Similar to the `HEAD` middleware, the `TRACE` middleware adds support for the [HTTP `TRACE` method][trace].

> The HTTP TRACE method performs a message loop-back test along the path to the target resource, providing a useful debugging mechanism.
>
> \- [TRACE &mdash; MDN][trace]

It echos the request (Status line + Headers) back to the client as the response body.
The `Cookie` header is excluded by default because it could contain sensitive information.

## Changes

- Progress on Websocket support. It's still not complete, but we are getting closer.
- Logger now holds a persistent file handle instead of opening and closing it every time.
- Use binary search on ServeStatic MMIE types.
  Because there are so few default types, this doesn't make much of a difference, but eh.
- Some optimizations throughout afire.
- Accept `impl Into<HeaderType>` in `RequestId::new` instead of just `AsRef<str>`.
  This allows for using `HeaderType`s as well as strings to set the header.
- Update `ServeStatic` to send a Content-Length header when streaming a file.

## Conclusion

Not too big of an update, but SSE was a good way to ease into Websockets.
There are some big changes I want to make to the way routes work.
Instead of each handler taking a `Request` and returning a `Response`, I want to make it, so each handler is given a server context and a request context.
This way routes could have some control over the server and thread pool, which will be important for Websockets.
The routes would then return Result<(), \_> so they can use the `?` operator instead of panicking, which would look something like this:

```rust
server.route("/api/user/{id}", |ctx, req| {
    let id = req.param("id");
    let user = ctx.state.db.get_user(id)?;

    // Not 100% sure how this would work yet
    // Maybe you would have to get a response builder from the context?
    ctx.send(user)?;
    Ok(())
});
```

Still not entirely sure, but this is a _very_ breaking change, so I want to make sure I get it right.

<!--  -->

[sse]: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
[head]: https://developer.mozilla.org/en-US/docs/web/http/methods/head
[trace]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/TRACE
