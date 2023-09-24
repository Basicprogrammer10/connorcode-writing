@Title = afire Update (V2.2.1)
@Author = Connor Slade
@Date = 08-20-23
@Description = Updates to afire in V2.2.1
@Tags = afire, afire v2.2.1, afire update
@Path = afire/update-8
@Assets = .

---

# 🔥 afire v2.2.1

afire `v2.2.1` was released August 20th, 2023.
This is a small patch update to fix two issues.

<div ad info>
Info

As always, a full update changelog is on [here on Github](https://github.com/Basicprogrammer10/afire/releases/tag/v2.2.1).

You can also find the afire docs on [docs.rs here](https://docs.rs/afire/latest/afire).

</div>

## Fixes

### Support Interrupted Streams

Responses can send static data (Vec\<u8\>) or streaming data (impl Read) but the support for streaming data would consider [ErrorKind::Interrupted](https://doc.rust-lang.org/std/io/enum.ErrorKind.html#variant.Interrupted) to be a fatal error that cant be recovered.
This would abort sending the response and log an error to the console.
In this update, if a stream is interrupted, it will just be tried again.

### Show extensions on docs.rs

For previous versions of afire, the extensions module was not enabled when building on docs.rs.
This made it more difficult to see the documentation for extensions.

## Future afire

I am currently working on afire `v3.0.0`, which is going to be a huge update.
I started working on it about three months ago, so it will probably also be a while before the final release comes out, but there have been some beta releases you can try.
The main goal of the update is to improve error handling and generally cleanup the api.
I first started afire over two years ago, when I was still not great at rust and many of the design choices I made then have carried over for long enough!

Some of the most important features so far are as follows:

- Improve error handling.
  Routes now returns Results and you can attach extra context to errors.
- You get a reference to the server struct in route handlers.
  This can allow for resizing the threadpool.
- Properly determine when to use keep-alive, ~2x performance increase in my benchmarks.
- Websocket support!
- Optimized and improved router.
  Now you can use parameters and wildcards without having to separate them with slashes (Ex: `/file/{name}.{ext}`).

## Conclusion

Thats all!
Not a big update, but these issues were causing problems on a project I was working on so I had to fix them.
