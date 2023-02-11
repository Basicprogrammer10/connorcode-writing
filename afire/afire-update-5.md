@Title = afire Update (V2.0.0)
@Author = Connor Slade
@Date = 02-10-23
@Description = Updates to afire in V2.0.0
@Tags = afire, afire v2.0.0, afire update
@Path = afire/update-5
@Assets = .

---

# 🔥 afire v2.0.0

Happy new year! (yes i know its february).
There have been some big changes to afire in the past, uh, _8 months_!
Ive only been working on afire again for about the past two weeks, but there is still a lot of new stuff!
There is a lot to cover, this is the biggest afire update to date - so lets get into it!

<div ad info>
Info

As always, a full update changelog is on [here on Github](https://github.com/Basicprogrammer10/afire/releases/tag/v2.0.0).

You can also find the afire docs on [docs.rs here](https://docs.rs/afire/latest/afire).

</div>

## TL;DR

There are a lot of changes in this update so her is a quick summery.

- Added support for socket keep alive. ([more](#socket-handling))
- Responses can now stream data with chunked transfer encoding. ([more](#streaming-responses))
- The socket handler has been rewritten to support long headers. ([more](#socket-handling))
- Enums have been added for Headers and Status codes. ([more](#headertype--status))
- The Middleware system has been rewritten again. ([more](#yet-another-middleware-rewrite))

## Changes

### Socket Handling

When benchmarking previous versions of afire against [actix][actix-web] for example, afire would always score worse.
This wasn't an issue with request parsing or routing it was actually because a new socket hand to be established for every request.
Clearly this is not very good.
So in this new update afire _finally_ has support for persistent connections with `Connection: keep-alive`!
You can read the RFC on persistent connections [here][persistant-connections].

But thats not all thats changed with afire socket handling, It now can also handle requests with a very large header section.
In the previous versions, the core stream code hadn't changed much since the first release when I was still leaning rust and web development.
Because of the poor implementation, the initial buffer size had to be big enough to find a `Content-Length` header.
This surprisingly did work, but it caused lots of issues with HTML forms using query parameters for data transfer or working with some OAUTH apis which also could have long queries.

### Streaming Responses

The next big new feature is the introduction of _streaming responses_ which make use of chunked transfer encoding to send anything that impls the Read trait.
The body field in the Response struct is no longer just a `Vec<u8>` but a new struct, a [ResponseBody][response-body]:

```rust
type Writeable = Box<RefCell<dyn Read + Send>>;

pub enum ResponseBody {
    Static(Vec<u8>),
    Stream(Writeable),
}
```

A static body will be sent in one go, while streams are sent in chunks using chunked transfer encoding.
This ResponseBody struct is not accessible to the users though, you will still add bodies to responses the same as usual (with `text` or `bytes`), but you can now use `stream` to add a streamed response.
This new streaming system is used internally by the ServeStatic middleware extension, which allows for faster download times and lower memory usage.

### Tracing

In afire there is a `tracing` feature which allowed you to see a helpful debug message when starting afire, showing the ordering of routes, number of threads and more.
While working on the new socket handling systems I needed some way to log socket events, so I used the built in trace! macro (from the tracing feature).
This gave me the idea to add log levels, so the socket errors could be colored red.
This was the beginning of the built-in trace system, which you can use for simple logging in your application.

Because of how its used internally there is a global log level, not one per server.
You can set this level with `afire::trace::set_log_level`, which takes one parameter a `afire::trace::Level`.
You can also set weather the logs have ANSI codes for color using `afire::trace::set_log_color`, color is enabled by default.
Now to use the logger there is the `trace!` macro, which you can use one of two different ways:

```rust
trace!(Level::<LOG_LEVEL>, <FORMATTED ARGS>)
trace!(<FORMATTED ARGS>) // uses the Trace level

// Examples
let a = 100;
trace!("The var a is currently {a}");
trace!(Level::Error, "An error occurred!");
```

The Log Levels are in the following order, with the more verbose levels at the bottom.
Setting the log level to Off will disable all logging.
Also note that Error is the default level.

- Off
- Error
- Trace
- Debug

### HeaderType & Status

While working on some example programs for afire I couldn't remember if 307 or 308 was the status code for a PermanentRedirect (its 308).
So I decided to add a big enum with all of the standard status codes, with a useful description in the doc comment.
This new enum is called `Status` and its used in `afire::Request` and `afire::Response`.
When adding a status code to a Response you must supply a type that impls `Into<Status>`, so this could be a Status variant or just any u16.
This means that you don't have to update all of your calls to `Response::status`.

I also decided to add an enum for menu of the different headers used, so I created the HeaderTypes enum.
Just like the Status enum, the functions that accept it will also still accept the old representation, a &str or String in this case.

### Header & Query Methods

### IpAddr

### New Errors

### New Extensions

### Yet Another Middleware Rewrite

(mention res.modify)

### Misc

- More info in the error response for IO errors
- Improved memory efficiency (less data cloning)
- Builtin content types in the [Content][content] enum now use charset=utf-8
- The error handler now has access to the server's app state
- Internal structs now have decent documentation
- Lots of documentation has been rewritten with better examples and less spelling errors
- Remade [SocialShare][social-share] image for github
- A new application example with persistent storage and an app struct

## Removed

- In the previous version of afire there were lots of feature flags that I don't think added anything to the library (cookies, path_patterns, dynamic_resize, path_decode_url, tracing), these have now been removed.
- Because of the new streaming response system Responses can't be cloned, which breaks the old cache middleware.
  I might re add it later to only cache static responses.
- The [Socket Handler][socket-handler] struct had been removed as is hasn't really been used and would have caused unnecessary friction in developing the new socket handling system.
  I do plan on finding a better way to add TLS support to afire in a future update.
- The [buff_size][buff-size] field on Server has been removed as the new socket handler will properly resize the buffer.
- The [set_run][set-run] method on Server has been removed as it is no longer needed internally.
  This function was never intended for external use, but was accessible.

## The Future

## Conclusion

I need to remember to add to the change log when I change things.
Its getting a bit old reading through huge diffs trying to pick out api changes.

<!-- LINKS -->

[content]: https://docs.rs/afire/latest/afire/prelude/enum.Content.html
[social-share]: https://github.com/Basicprogrammer10/afire/blob/main/SocialShare.png
[socket-handler]: https://github.com/Basicprogrammer10/afire/blob/9d1dd37a6148f85bef65b79587c0f5bfbf4070c0/lib/internal/socket_handler.rs
[buff-size]: https://github.com/Basicprogrammer10/afire/blob/9d1dd37a6148f85bef65b79587c0f5bfbf4070c0/lib/server.rs#L33
[set-run]: https://github.com/Basicprogrammer10/afire/blob/9d1dd37a6148f85bef65b79587c0f5bfbf4070c0/lib/server.rs#L358
[actix-web]: https://actix.rs
[persistant-connections]: https://www.rfc-editor.org/rfc/rfc2068.html#section-19.7.1
[response-body]: //TODO
