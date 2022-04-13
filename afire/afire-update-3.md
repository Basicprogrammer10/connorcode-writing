@Title = afire Update (V1.1.0)
@Author = Connor Slade
@Date = 04-10-22
@Description = Updates to afire in V1.1.0
@Tags = afire, afire v1.1.0, afire update
@Path = afire/update-3
@Assets = .

---

# 🔥 afire v1.1.0

well this is an interesting update.
There is an important security notice so make sure to read that.

<div ad info>
Info

As always, a full update changelog is on GitHub [here](https://github.com/Basicprogrammer10/afire/blob/v1.1.0/Changelog.md).

</div>

## 🔒 Security

### Path Traversal serve_static extension

This is kinda *really important*.
The official security advisory thing is [here][path-traversal-advisory].

So this is a vulnerability that effects the built-in `serve_static` extension allowing paths containing `//....` to bypass the previous path sanitation and request files in higher directories that should not be accessible.
This vulnerability can be categorized under [CWE-34][cwe-34].

If you can update to the latest version of afire (>=1.1.0) where this is fixed.
But if you can't, there is a temporary fix of simply disallowing paths containing `/..` with the following middleware:

```rust
use afire::prelude::*;

struct PathTraversalFix;

impl Middleware for PathTraversalFix {
    fn pre(&self, req: Request) -> MiddleRequest {
        if req.path.replace("\\", "/").contains("/..") {
            return MiddleRequest::Send(
                Response::new()
                    .status(400)
                    .text("Paths containing `..` are not allowed"),
            );
        }

        MiddleRequest::Continue
    }
}
```

That middleware can be attached to the server like this.
Make sure this is the last middleware added to the server so it runs first, stopping the bad requests.

```rust
let mut server = Server::new(host, port);
PathTraversalFix.attach(&mut server);
```

## 💎 New Features

### Socket handler

This is a new field on the server struct that lets you define the socket methods used for reading and writing to the client.
This could be used to add TLS support to an afire application.
I haven't yet finished the crate for doing this ad the whole security vulnerability made it really important to get this update out soon.

The crate is currently being developed on GitHub [here][afire-tls].

### AnyAfter Path Segments

This is a new type of path segment (`**`) that matched anything after itself.
Here is an example showing some different paths that wound match to `/files/**`.
This example will not match on just `/files`

```
/files/hello.txt
/files/hello/world.txt
/files/this/will/match/anything/after/files
```

### Pastebin app example

afire already has some basic examples showing how to start a server, make routes, etc. but now Im starting to add some 'applacation examples'.
This is the first one, a simple in memory Pastebin API.

## 🐱 Conclusion

definitely an interesting update,,,
Make sure to update all of your applications running on afire and make sure to keep request logs so you can see if and how you spicily were affected by this.


[path-traversal-advisory]: https://github.com/Basicprogrammer10/afire/security/advisories/GHSA-3227-r97m-8j95
[cwe-34]: https://cwe.mitre.org/data/definitions/34.html
[afire-tls]: https://github.com/Basicprogrammer10/afire_tls
