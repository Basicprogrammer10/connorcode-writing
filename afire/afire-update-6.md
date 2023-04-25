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
The default formatter just prints the log to stdout, if you change the formatter you can do whatever you would like.
The formatters format method is only called if the global log level allows that message to be logged.
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
As with all extensions you need to enable the `extensions` feature flag for them to be accessible.
There are two functions added to the [`Request`] when the trait (`afire::extension::RealIp`) is imported:

```rust
fn real_ip_header(&self, header: impl Into<HeaderType>) -> IpAddr;
fn real_ip(&self) -> IpAddr;
```

The `real_ip_header` function will check if the request is coming from a loopback address (localhost) and if so look for the spesified header to extract the Ip from.
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
Here is an example route that accepts any file (in a multipart file field) and echos it back to the client.

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

Responses now have a flag field that allows you do make a response close or end the connection.
Close will set the Connection header to close and will close the connection _after the response is sent_.
End will end the connection _without sending a response_.
These flags can be accessed like this:

```rust
Response::new().text("goodbye!").close()
Response::end()
```

The reason this was introduced is to allow for the possibility of continuing from routes and running the next route that matches the path.

### Websocket Progress

[websocket-issue]: https://github.com/Basicprogrammer10/afire/issues/29

Although [Websocket support][websocket-issue] is not yet finished, or even close really, Ive made some progress on it that is worth mentioning.
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

// TODO: finish this section

Some new _container structs_ have been introduces as well, for Headers, Cookies, and Header Parameters.
These are in place of just using `Vec`s to hold specific elements and make interfacing with them easier.

- Headers
- CookieJar
- HeaderParams

### Misc

[`Request`]: https://docs.rs/afire/latest/afire/struct.Request.html
[request::body_str]: https://docs.rs/afire/latest/afire/struct.Request.html#method.body_str
[server::app]: https://docs.rs/afire/latest/afire/struct.Server.html#method.app
[query::get_query]: https://docs.rs/afire/latest/afire/struct.Query.html#method.get_query

- Added support for serving IPv6 addresses
- Added a [`body_str`][request::body_str] method to `Request`, which converts the request body into a string using `String::from_utf8_lossy`
- Added a [`app`][server::app] method to `Server` to get a reference to the server state after passing it to the `state` method
- Added a [`get_query`][query::get_query] method on `Query` which gets the key value pare (if it exists) as a `[String; 2]`

## Changes

- Changed default log level back to Error, it was Off in the last version
- Change encoding system module format, functions like url encode can now be accessed like `afire::internal::encoding::url::encode`
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

// TODO: touch on how some of the goals from the previous 'the future' section are going and outline some more hopes for the future (optional body loading + more frequent smaller releases)

## Conclusion

// TODO: this
