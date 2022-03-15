@Title = afire Update (V1.0.0)
@Author = Connor Slade
@Date = 03-14-22
@Description = Changes to afire in V1.0.0!
@Tags = afire, afire v1.0.0, afire update
@Path = afire/update-2
@Assets = .

---

# 🔥 afire v1.0.0

yep you saw the title,,, [afire][afire] `1.0.0` is out!!!
I'm going to go with the main document structure used in the previous afire update.
This update is kinda small, as I couldn't really think of many more features to add.
_well i guess that just means it sooo good you can't improve it_ or something like that.

<div ad info>
Info

As always, a full changelog can be found on GitHub [here](https://github.com/Basicprogrammer10/afire/blob/1.0.0/Changelog.md).

</div>

## 🗽 New Features

### Thread Pool!

I tried and failed to add this to afire so many times.
Somehow I managed to get it working this time.
This was the thing that was keeping me from releasing a V1.0,
I feel that it isn't really production ready if it doesn't have a thread pool.

So, how do you use a thread pool?
Well, I'm glad you asked, and it couldn't be easier!

```rust
let mut server = Server::new("localhost", 8080);

...

server.start_threaded(8);
```

Yep that's all.
Who would have that such a simple looking thing would be so hard :p

### End Middleware

This is a new type of middleware that runs after the response had been sent to the client.
It can't modify the request or response, but it has access to them.
This could be useful for many things, including loggers and analytics systems because the time they take to run won't affect the request time.

There really isn't anything new to show in terms of syntax, so I'll just show the new Trait definition for Middleware.

```rust
pub trait Middleware {
    fn pre(&self, _req: Request) -> MiddleRequest {
        MiddleRequest::Continue
    }

    fn post(&self, _req: Request, _res: Response) -> MiddleResponse {
        MiddleResponse::Continue
    }

    fn end(&self, _req: Request, _res: Response) {}
}
```

### Tracing Feature

This is a little debugging feature.
It's enabled with the `tracing` feature and displays when routes and Middleware are added.
When using it with my website, it prints the following output.

```text
🐍 Initializing Server v1.0.0
😀 Adding Server Header (X-Content-Type-Options: nosniff)
😀 Adding Server Header (X-Frame-Options: DENY)
😀 Adding Server Header (X-Version: Connorcode/6.5.0)
😀 Adding Server Header (X-Server: afire/0.4.1*)
⏳ Setting Socket timeout to 5s
✌ Setting Error Handler
🚗 Adding Route ANY **
🚗 Adding Route GET /
🚗 Adding Route GET /api/projects
🚗 Adding Route GET /api/analytics
🚗 Adding Route GET /api/status
🚗 Adding Route GET /api/git
🚗 Adding Route GET /api/headers
🚗 Adding Route GET /api/ip
🚗 Adding Route GET /api/randomcolor
🚗 Adding Route GET /api/randomnose
🚗 Adding Route GET /api/rawhttp
🚗 Adding Route GET /key
🚗 Adding Route GET /r/{code}
🚗 Adding Route GET /randomimg/image.png
📦 Adding Middleware connorcode::components::ComponentManager
📦 Adding Middleware connorcode::middleware::cache_header::Cache
📦 Adding Middleware connorcode::writing::Writing
📦 Adding Middleware connorcode::files::Files
📦 Adding Middleware connorcode::analytics::Analytics
📦 Adding Middleware connorcode::logger::Logger
✨ Starting Server [0.0.0.0:8080]
```

It can be really helpful for seeing the order in which things are added.
It also lets you use the `trace!` macro in your own project, but it requires you to enable the `tracing` feature on that crate.

## ⛓ Changes

### Removed Middleware Interior Mutability

well that sure is a long heading.
anyway, in previous versions the Middleware trait looked kinda like this:

```rust
pub trait Middleware {
    fn pre(&mut self, _req: Request) -> MiddleRequest {
        MiddleRequest::Continue
    }

    fn post(&mut self, _req: Request, _res: Response) -> MiddleResponse {
        MiddleResponse::Continue
    }

    ...
}
```

As you can see, self is mutable, and this caused some problems with the thread pool.
In order to have this mutability each Middleware was in a [RefCell][refcell], the issue with this was the locking.
In order to maintain safety, only one lock to a resource could be held at once.
This meant that if a middleware took a while to execute, it would cause all other threads handling requests to wait, basically undoing the performance benefit of a thread pool.

So to fix this, Middleware was made not mutable.
If you want to have mutability, you can add it yourself or use the Atomic types if possible.

### Make remove_address_port usable without Feature

this one is kinda boring, but before `internal::common::remove_address_port` was only accessible with some features enabled.
But I found that it was useful a lot and ended up enabling one of those features just to be able to use it.
So now it's there by default!

### Logger End Middleware

Somehow this one is even shorter than the last!
The built-in Logger middleware has been updated to use the new end Middleware.
_so... your website can be clock cycles faster!_

## 🥧 Conclusion

First off, **HAPPY PI DAY**!!!

This is the first version of afire to use SemVer, so that's nice.
Hopefully this means that I will release more frequent updates and not have to reference the git repo as a dependency all the time :p

Have a nice day - Darren

[afire]: https://crates.io/crates/afire
[refcell]: https://doc.rust-lang.org/std/cell/struct.RefCell.html
