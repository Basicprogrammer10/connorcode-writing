@Title = afire Update (V2.1.0)
@Author = Connor Slade
@Date = 04-25-23
@Description = Updates to afire in V2.1.0
@Tags = afire, afire v2.1.0, afire update
@Path = afire/update-6
@Assets = .

---

<style>
    span[title] {
        text-decoration: underline;
    }
</style>

# 🔥 afire v2.1.0

This update is not as big as the previous one, but it still brings some nice quality-of-life improvements to afire.
Some of the main changes are: Custom log formatters, a real IP extension, and Multipart request support.

<div ad info>
Info

As always, a full update changelog is on [here on Github](https://github.com/Basicprogrammer10/afire/releases/tag/v2.1.0).

You can also find the afire docs on [docs.rs here](https://docs.rs/afire/latest/afire).

</div>

## Added

### Custom Log Formatters

[`trace!`]: https://docs.rs/afire/latest/afire/macro.trace.html
[tokio-tracing]: https://github.com/tokio-rs/tracing

You can now use your own Formatters with the [`trace!`] macro.
The default formatter just prints the log to stdout, but with a custom formatter, this behavior can be changed to whatever you want.
This could allow you to pipe the trace events into another logging system like [tokio-tracing].
Below is an example of how you could do that:

```rust
use afire::trace::{self, Formatter, Level};
use tracing::event;

// Create a new struct to implement the Formatter on
pub struct TracingLogger;

// The Formatter trait has only one method to implement: format
impl Formatter for TracingLogger {
    // Re-broadcast events to tokio-tracing from afire's tracing system
    // Note: This method is only called if the global log level allows a message to be logged.
    fn format(&self, level: Level, _color: bool, msg: String) {
        match level {
            Level::Off => {}
            Level::Error => event!(target: "afire::logger", tracing::Level::ERROR, "{msg}"),
            Level::Debug => event!(target: "afire::logger", tracing::Level::DEBUG, "{msg}"),
            Level::Trace => event!(target: "afire::logger", tracing::Level::INFO,  "{msg}"),
        }
    }
}

fn main() {
    // Set afire's global log formatter to `TracingLogger`
    // Also set its global log level to Trace
    trace::set_log_formatter(TracingLogger);
    trace::set_log_level(Level::Trace);
    // SNIP...
}
```

### Real IP Extension

[nginx-docs]: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy
[nginx]: https://nginx.org

This extension lets you get the actual IP address of a request that has been passed through a <span title="an application that sits in front of back-end applications and forwards client (e.g. browser) requests to those applications - Wikipedia">reverse proxy</span>.
As with all extensions, you need to enable the `extensions` feature flag for them to be accessible.
There are two functions added to the `Request` when the trait (`afire::extension::RealIp`) is imported:

```rust
fn real_ip_header(&self, header: impl Into<HeaderType>) -> IpAddr;
fn real_ip(&self) -> IpAddr;
```

The `real_ip_header` function will check if the request is coming from a loopback address (localhost) and if so look for the specified header to extract the IP from.
If the request did not come from loopback the raw socket address will be returned.
The `real_ip` function calls the previous function with the default header of `X-Forwarded-For`.

<div ad warn>
Warning

Make sure your reverse proxy is overwriting the specified header on the incoming requests so clients cant spoof their original IPs.

</div>

If you are using [Nginx][nginx] the header can be added like this ([official docs][nginx-docs]):

```conf
location / {
    proxy_pass http://localhost:<PORT>;
    proxy_set_header X-Forwarded-For $remote_addr;
}
```

### Multipart Request Parser

[multipart-request]: https://stackoverflow.com/a/19712083/12471934
[`MultipartData`]: https://docs.rs/afire/latest/afire/multipart/struct.MultipartData.html

HTTP [Multipart Requests][multipart-request] are often used to upload multiple file to a server with a single request.
These can now be parsed with the [`MultipartData`] struct.
Here is an example route that accepts any file (in a multipart 'file' field) and echos it back to the client.

<div ad note>
Note

The parser _will_ fail if the Content-Type is not `multipart/form-data`.

</div>

```rust
server.route(Method::POST, "/file-upload", |req| {
    let multipart = MultipartData::try_from(req).unwrap();
    let entry = multipart.get("file").unwrap();

    Response::new().bytes(entry.data).content(Content::Custom(
        entry.headers.get(HeaderType::ContentType).unwrap(),
    ))
});
```

### Response Flags

Responses now have a flag field that allows you to make a response close or end the connection.
Close will set the Connection header to close and will close the connection _after the response is sent_.
End will end the connection _without sending a response_.
These flags can be accessed like this:

```rust
Response::new().text("goodbye!").close()
Response::end()
```

The reason this was introduced is to allow for the possibility of continuing from routes and running the next route that matches the path in the future.

### Websocket Progress

[websocket-issue]: https://github.com/Basicprogrammer10/afire/issues/29

Although [Websocket support][websocket-issue] is not yet finished, or even close really, I have made some progress on it that is worth mentioning.
I have implemented the WS handshake, which wouldn't normally be difficult at all, but because afire is dependency free I had to implement base64 en/decoding as well as MD5 hashing.
Below is the route I used to test the handshake:

```rust
const WS_GUID: &str = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
server.route(Method::GET, "/ws", |req| {
    let ws_key = req.headers.get("Sec-WebSocket-Key").unwrap().to_owned();
    let accept = base64::encode(&sha1::hash((ws_key + WS_GUID).as_bytes()));

    let mut upgrade = Response::new()
        .status(Status::SwitchingProtocols)
        .header(HeaderType::Upgrade, "websocket")
        .header(HeaderType::Connection, "Upgrade")
        .header("Sec-WebSocket-Accept", &accept)
        .header("Sec-WebSocket-Version", "13");
    upgrade.write(req.socket.clone(), &[]).unwrap();

    Response::end()
});
```

### Container Structs

[header-query-methods]: https://connorcode.com/writing/afire/update-5#header--query-methods
[Headers]: https://docs.rs/afire/latest/afire/header/struct.Headers.html
[CookieJar]: https://docs.rs/afire/latest/afire/cookie/struct.CookieJar.html
[HeaderParams]: https://docs.rs/afire/latest/afire/header/struct.HeaderParams.html

Some new _container structs_ have been introduced as well, for Headers, Cookies, and Header Parameters.
These are in place of just using `Vec`s to hold specific elements and make interfacing with them easier.
The basic idea of these systems was explained in the [previous release notes][header-query-methods].
The structs in question are:

- [Headers] — Holds headers on the request and response
- [CookieJar] — Holds cookies on the request
- [HeaderParams] — Holds header parameters (e.g. `charset=utf-8`)

### Misc

[request::body_str]: https://docs.rs/afire/latest/afire/struct.Request.html#method.body_str
[server::app]: https://docs.rs/afire/latest/afire/struct.Server.html#method.app
[query::get_query]: https://docs.rs/afire/latest/afire/struct.Query.html#method.get_query

- Added support for serving IPv6 addresses
- Added a [`body_str`][request::body_str] method to `Request`, which converts the request body into a string using `String::from_utf8_lossy`
- Added a [`app`][server::app] method to `Server` to get a reference to the server state after passing it to the `state` method
- Added a [`get_query`][query::get_query] method on `Query` which gets the key value pare (if it exists) as a `[String; 2]`

## Changes

- Changed default log level back to Error, it was Off in the last version
- Change encoding system module format, functions like URL encode can now be accessed like `afire::internal::encoding::url::encode`
- Increase ServeStatic compatibility with other middleware. It now uses MiddleResponse::Continue rather than Send.
- Implemented ToHostAddress for &String
- Optional emojis in logging, controlled by the `emoji-logging` feature flag
- Fix the Display implementation on Query.
- Impl std::error::Error for afire::Error
- Impl Display for error types
- Don't execute format on lower log-levels. This makes the trace feature slightly more performant in some cases.
- Fix spelling errors :eyes:
- Fix Logger middleware always appending ? to the path. It would previously return '?' if there was no query, its now ''.
- Don't consider sockets closing to be an error (only printed in debug tracing)
- Mild performance improvements in the path matcher with catch-all routes

## The Future

[half-stack]: https://github.com/Basicprogrammer10/half-stack

In the previous release notes, I outlined some goals for the future of afire:

- Websocket support
- HTTPS support
- [half-stack]

I updated you on Websocket support in the [Websocket Progress](#websocket-progress) section, and I haven't made any progress on HTTPS support.
But with half-stack, I'm still trying to figure out what I want it to be.
It could either keep with the dependency free nature of afire, which would be a fun challenge, but I would also make some kinds of compatibility impossible to do safely.
I already wrote my own JSON library (idk why :sob:) and this was the inspiration for half-stack, because I didn't want all that work to go to waste.

Anyway, is a new goal I have for, maybe not the next release, but the future of afire.
It is _optional body loading_, which would allow running the route right after loading the request line (method, path, version) and headers, but before loading the body.
This would allow for faster responses in some cases and would also allow for lower memory usage in some cases.
It would be kinda difficult to implement for not too much gain, and if you don't use the body it would still have to be send over the socket but just ignored.
So who knows if I will ever get to that, but it's an option.

## Conclusion

It's been _almost_ two years since I started this project (like four months off).
This was one of my earlier actual projects using rust, and Its dependency free nature has really forced me to learn a lot.
I don't think I would have thought it would come this far, but I'm happy to say that it is undeniably the best web server framework for ~~rust~~ me.
I think I have kept with this project because although there are very popular frameworks like Rocket, and Axum out there, their APIs weren't designed to be exactly what I liked.
afire has grown with my rust experience and has become a system that _all_ of my recent web projects make use of it (including this site ofc).
So let's hope for another two years of afire.
