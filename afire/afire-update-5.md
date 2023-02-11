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
This is the biggest afire update to date - so lets get into it!

<div ad info>
Info

As always, a full update changelog is on [here on Github](https://github.com/Basicprogrammer10/afire/releases/tag/v2.0.0).

You can also find the afire docs on [docs.rs here](https://docs.rs/afire/latest/afire).

</div>

## TL;DR

There are a lot of changes in this update so here is a quick summery.

- Added support for socket keep alive. ([more](#socket-handling))
- Responses can now stream data with chunked transfer encoding. ([more](#streaming-responses))
- The socket handler has been rewritten to support long headers. ([more](#socket-handling))
- Enums have been added for Headers and Status codes. ([more](#headertype--status))
- The Middleware system has been rewritten again. ([more](#yet-another-middleware-rewrite))

## Changes

### Socket Handling

When benchmarking previous versions of afire against [actix][actix-web] for example, afire would always score worse.
This wasn't an issue with request parsing or routing it was actually because a new socket had to be established for every request.
Clearly this is not very efficient.
So in this new update afire _finally_ has support for persistent connections with `Connection: keep-alive`!
You can read the RFC on persistent connections [here][persistant-connections].

But thats not all thats changed with afire socket handling, It now can also handle requests with a very large header section.
In the previous versions, the core stream handling code hadn't changed much since the first release when I was still leaning rust and web development.
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
This ResponseBody struct is not accessible to the users though, you will still add bodies to responses the same as usual (with [`text`][res-text] or [`bytes`][res-bytes]), but you can now use [`stream`][res-stream] to add a streamed response.
This new streaming system is used internally by the ServeStatic middleware extension, which allows for faster download times and lower memory usage.

### Tracing

In afire there is a `tracing` feature which allows you to see a helpful debug message when starting afire, showing the ordering of routes, number of threads and more.
While working on the new socket handling systems I needed some way to log socket events, so I used the built in trace! macro (from the tracing feature).
This gave me the idea to add log levels, so the socket errors could be colored red.
This was the beginning of the built-in trace system, which you can use for simple logging in your application.

Because of how its used internally there is a global log level, not one per server.
You can set this level with [`afire::trace::set_log_level`][set-log-level], which takes one parameter an [`afire::trace::Level`][trace-level].
You can also set weather the logs have ANSI codes for color using [`afire::trace::set_log_color`][set-log-color], color is enabled by default.
Now to use the logger there is the [`trace!`][trace-macro] macro, which you can use one of two different ways:

```rust
trace!(Level::<LOG_LEVEL>, <FORMATTED ARGS>)
trace!(<FORMATTED ARGS>) // uses the Trace level

// Examples
let a = 100;
trace!("The var a is currently {a}");
trace!(Level::Error, "An error occurred!");
```

<div ad note>
Note

The tracing feature if off by default.
So if you want to see the debug output or use trace! in your own code make sure to enable it.

</div>

The Log Levels are in the following order, with the more verbose levels at the bottom.
Setting the log level to Off will disable all logging.

- Off
- Error
- Trace
- Debug

### HeaderType & Status

While working on some example programs for afire I couldn't remember if 307 or 308 was the status code for a permanent redirect (its 308).
So I decided to add a big enum with all of the standard status codes, with a useful description in each doc comment.
This new enum is called [`Status`][status] and its used in `afire::Request` and `afire::Response`.
When adding a status code to a Response you must supply a type that impls `Into<Status>`, so this could be a Status variant or just any u16.
This means that you don't have to update all of your calls to `Response::status`.

I also decided to add an enum for many of the different headers used, so I created the [HeaderTypes][header-types] enum.
Just like the Status enum, the functions that accept it will also still accept the old representation, a &str or String in this case.

### Header & Query Methods

Previously to access a header you could do `req.header("...")` to get an `Option<String>`, this has been changed.
You can now access `req.headers` to get a [Headers][headers] struct, which can hold many different Headers.
You can use the following methods on it:

```rust
// See if the collection contains a header of type name
pub fn has(&self, name: impl Into<HeaderType>) -> bool

// Get the value of the first header of type `name`
pub fn get(&self, name: impl Into<HeaderType>) -> Option<&str>

// Like get but returns a mutable reference to the value
pub fn get_mut(&mut self, name: impl Into<HeaderType>) -> Option<&mut String>

// Like get but returns the whole Header struct, not just the value
pub fn get_header(&self, name: impl Into<HeaderType>) -> Option<&Header>

// Like get_header but it returns a mutable reference to the Header
pub fn get_header_mut(&mut self, name: impl Into<HeaderType>) -> Option<&mut Header>
```

The [Query][query] struct has been updated to have methods more similar to that of the new Headers struct.
It has `has`, `get`, `get_mut` and `get_query_mut` methods, which function like the ones on Headers.

### IpAddr

This is another remnant from the very beginning of afire.
In previous versions of afire the client address was stored as a string ('{IP}:{PORT}') in the Request struct.
This meant if you wanted to get just the IP address on its own you would have to split the string on ':', this is not very nice.
So now the `address` field on Server holds a [SocketAddr][socket-addr], which has methods like `ip` and `port`.
This change has been sitting in the dev branch for a few months now, its good to finally get it released.

The other IP Address related change is in the `Server::new` function.
Previously you had to define the IP to bind to as a string (`x.x.x.x`) but you can now use a Ipv4Addr, [u8; 4], String or &str.
This allows you to use the `Ipv4Addr::LOCALHOST` const as a bind IP, which I think is nicer that defining it as a string.

```rust
use std::net::Ipv4Addr;

// Create a new server on localhost with a string
Server::new("127.0.0.1", 8080);

// Create a new server on localhost with a [u8; 4]
Server::new([127, 0, 0, 1], 8080);

// Create a new server on localhost with the Ipv4Addr const
Server::new(Ipv4Addr::LOCALHOST, 8080);
```

### New Errors

There is not too much news here, but two new types of errors have been introduced: Startup errors and Stream errors.
A startup error can either be an InvalidIp error, a NoState error or an InvalidSocketTimeout error.
You can read more about whey they each mean in the [docs][startup-error].
The Stream error can currently only be a UnexpectedEof error.
The IO error type also now shows more information if triggered.

### New Extensions

A new extension has been added to afire.
Its a new middleware called Date, it adds the HTTP Date header (as defined in [RFC 9110, Section 5.6.7][rfc-9110-5-6-7]) to outgoing responses.
The header that is added by this middleware looks like this: `Date: Wed, 08 Feb 2023 23:39:57 GMT`.
This is technically required for all servers that have a clock, so I may move it to the core library at some point.

### Yet Another Middleware Rewrite

It hasn't even been a single release since the middleware system last changed.
At least I think im getting closer to a more permanent solution (although thats what I thought last time).
In the previous version I made it so you had to deal with Requests and Responses in Results when making middleware.
But I found that I rarely needed to handle the error cases and almost always just continued if there was an error.
So with this new-new system, you have the option to deal with the results or just only handle the event if its all Ok.

There are now two types of hooks: raw and non-raw (very creative, i know).
The raw hooks are passed a Result, and their default implementation calls the non-raw hooks if all the Result is Ok.
This allows you to handle errors (like page not found), while maintaining a clean API for middleware that doesn't need to handle errors.
There are these normal and raw versions of handlers for (pre, post, and end).
These handlers will be passed mutable references to the Request and or Response when applicable.

The type returned from middleware hooks has also changed.
Previously there was a `MiddleResponse` and a `MiddleRequest`, but both of those have been combined into the [`MiddleResult`][middle-result].
Its an enum with three variants: Continue, Abort and Send(Response).
Continue is the default behavior, it does basically nothing; Abort stops executing the current middleware chain and Send immediately sends the supplied Response.

Middleware is still kinda complicated to write (although simpler now), so I would recommend reeding into the [docs][middle-docs] and some [examples][middle-examples] if you want to learn more.

### Misc

Now for some smaller changes that don't get their own sections:

- More info in the error response for IO errors
- Improved memory efficiency (less data cloning)
- Builtin content types in the [Content][content] enum now use charset=utf-8
- The error handler now has access to the server's app state
- Internal structs now have decent documentation
- Lots of documentation has been rewritten with better examples and less spelling errors
- Remade [SocialShare][social-share] image for github
- A new application example with persistent storage and an app struct

## Removed

- In the previous version of afire there were lots of feature flags that I don't think added anything to the library (cookies, path_patterns, dynamic_resize, path_decode_url), these have now been removed.
- Because of the new streaming response system Responses can't be cloned, which breaks the old cache middleware.
  I might re add it later to only cache static responses.
- The [Socket Handler][socket-handler] struct had been removed as is hasn't really been used and would have caused unnecessary friction in developing the new socket handling system.
  I do plan on finding a better way to add TLS support to afire in a future update.
- The [buff_size][buff-size] field on Server has been removed as the new socket handler will properly resize the buffer.
- The [set_run][set-run] method on Server has been removed as it is no longer needed internally.
  This function was never intended for external use, but was accessible.

## The Future

I made a lot of progress on afire with this update, but there is always more do add!
Currently im working on a more batteries-included extension to afire called [half-stack][half-stack], you can check it out on Github.
I also want to add HTTPS support somehow to afire, without adding any dependencies.
Farther in the future I hope to add websocket support, which will probably require lots more changes.

## Conclusion

In conclusion, I need to remember to add to the changelog when I change things.
Its getting a bit old reading through huge diffs trying to pick out api changes.

Looking back at [afire v1.2.0 release notes][afire-1.2.0], I cant believe I thought I would make the next release in around a month.
I forgot I had written down some hopes for the next version, but im happy to report that both goals (keep-alive and streaming support) have been achieved in this version.

Have an excellent day! — Connor

<!-- LINKS -->

[content]: https://docs.rs/afire/latest/afire/prelude/enum.Content.html
[social-share]: https://github.com/Basicprogrammer10/afire/blob/main/SocialShare.png
[socket-handler]: https://github.com/Basicprogrammer10/afire/blob/9d1dd37a6148f85bef65b79587c0f5bfbf4070c0/lib/internal/socket_handler.rs
[buff-size]: https://github.com/Basicprogrammer10/afire/blob/9d1dd37a6148f85bef65b79587c0f5bfbf4070c0/lib/server.rs#L33
[set-run]: https://github.com/Basicprogrammer10/afire/blob/9d1dd37a6148f85bef65b79587c0f5bfbf4070c0/lib/server.rs#L358
[actix-web]: https://actix.rs
[persistant-connections]: https://www.rfc-editor.org/rfc/rfc2068.html#section-19.7.1
[response-body]: https://github.com/Basicprogrammer10/afire/blob/95c22c3a5ef21ac8653c5107c983f80520f21440/lib/response.rs#L40
[res-text]: https://docs.rs/afire/latest/afire/prelude/struct.Response.html#method.text
[res-bytes]: https://docs.rs/afire/latest/afire/prelude/struct.Response.html#method.bytes
[res-stream]: https://docs.rs/afire/latest/afire/prelude/struct.Response.html#method.stream
[trace-macro]: https://docs.rs/afire/latest/afire/macro.trace.html
[set-log-level]: https://docs.rs/afire/latest/afire/trace/fn.set_log_level.htmls
[set-log-color]: https://docs.rs/afire/latest/afire/trace/fn.set_log_color.html
[trace-level]: https://docs.rs/afire/latest/afire/trace/enum.Level.html
[status]: https://docs.rs/afire/latest/afire/enum.Status.html
[header-types]: https://docs.rs/afire/latest/afire/header/enum.HeaderType.html
[headers]: https://docs.rs/afire/latest/afire/header/struct.Headers.html
[query]: https://docs.rs/afire/latest/afire/struct.Query.html
[startup-error]: https://docs.rs/afire/latest/afire/error/enum.StartupError.html
[half-stack]: https://github.com/Basicprogrammer10/half-stack
[socket-addr]: https://doc.rust-lang.org/std/net/enum.SocketAddr.html
[rfc-9110-5-6-7]: https://www.rfc-editor.org/rfc/rfc9110.html#section-5.6.7
[middle-result]: https://docs.rs/afire/latest/afire/middleware/enum.MiddleResult.html
[middle-docs]: https://docs.rs/afire/latest/afire/middleware/index.html
[middle-examples]: https://github.com/Basicprogrammer10/afire/blob/main/examples/basic/middleware.rs
[afire-1.2.0]: /writing/afire/update-4
