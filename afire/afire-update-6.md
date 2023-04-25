@Title = afire Update (V2.1.0)
@Author = Connor Slade
@Date = 04-25-23
@Description = Updates to afire in V2.1.0
@Tags = afire, afire v2.1.0, afire update
@Path = afire/update-6
@Assets = .

---

# 🔥 afire v2.1.0

<div ad info>
Info

As always, a full update changelog is on [here on Github](https://github.com/Basicprogrammer10/afire/releases/tag/v2.1.0).

You can also find the afire docs on [docs.rs here](https://docs.rs/afire/latest/afire).

</div>

## Added

### Custom Log Formatters

### Real IP Extension

### Multipart Request Parser

### Response Flags

### Websocket Progress

### Container Structs

- Headers
- CookieJar
- HeaderParams

### Misc

[request]: https://docs.rs/afire/latest/afire/struct.Request.html
[request::body_str]: https://docs.rs/afire/latest/afire/struct.Request.html#method.body_str
[string::from_utf8_lossy]: https://doc.rust-lang.org/std/string/struct.String.html#method.from_utf8_lossy
[server]: https://docs.rs/afire/latest/afire/struct.Server.html
[server::app]: https://docs.rs/afire/latest/afire/struct.Server.html#method.app
[server::state]: https://docs.rs/afire/latest/afire/struct.Server.html#structfield.state
[query]: https://docs.rs/afire/latest/afire/struct.Query.html
[query::get_query]: https://docs.rs/afire/latest/afire/struct.Query.html#method.get_query

- Added support for serving IPv6 addresses
- Added a [`body_str`][request::body_str] method to [`Request`][request], which converts the request body into a string using [`String::from_utf8_lossy`][string::from_utf8_lossy]
- Added a [`app`][server::app] method to [`Server`][server] to get a reference to the server state after passing it to the [`state`][server::state] method
- Added a [`get_query`][query::get_query] method on [`Query`][query] which gets the key value pare (if it exists) as a `[String; 2]`

## Changes

- Changed default log level back to Error
- Change encoding system module format
- Impl ToHostAddress for &String
- Increase ServeStatic compatibility with other middleware
- Optional emoji in logging
- Fix the Display impl on Query
- Impl std::error::Error for afire::Error
- Impl Display for error types
- Don't execute format on lower log-levels
- Fix spelling errors
- Fix Logger middleware always appending ? to the path
- Don't consider sockets closing to be an error (only printed in debug tracing)
- Mild performance improvements in the path matcher with catch-all routes
