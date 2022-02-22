@Title = Making a Simple API
@Author = Connor Slade
@Date = 02-22-21
@Description = Making a simple JSON API with afire
@Tags = afire, rust, webserver framework, web server, API
@Path = afire/making-a-simple-api
@Assets = .

---

# 🧵 Making a simple API

In this article, I will show you how to make a simple JSON API with [afire][afire].
This article assumes you have some rust experience already.
If not check out the Rust Book [here][rust-book].
For the project, let's make a random quote API.

## 🏈 Planning

Onto the _most important_ part of any project: Planning!
The plan can be changed later, but it is really helpful to know what you are trying to make.

So, let's find some quotes first. I found a quote dataset on [kaggle][kaggle], download it [here][quote-dataset].

Now to plan what API endpoints we want.
To start, let's keep it simple and use these endpoints:

- Get a random quote
- Get a quote by ID

## 🏨 Building

Now that we have our plan, we can start the fun part!

### Setup

So first create a new cargo project and add the following dependencies to `Cargo.toml`:

<div ad warn>
  Warning

  By the time you are reading this, these versions could be out of date.
</div>

```toml
[dependencies]
# Web server framework
afire = "0.4.0"

# Random Stuff
rand = "0.8.5"

# Json serializing / deserializing
serde_json = "1.0"
```

Now take the quotes we downloaded from before and add the `quotes.json` file to the project root.

### JSON Parsing

First, let's define a quote struct to store the author and quote text:

```rust
struct Quote {
    quote: String,
    author: String,
}
```

Now we can make a `parse_json` function to well,,, parse the quote JSON.
It will return an Option Vector of Quotes.

We will then loop through the array, paring the Quotes and pushing them to a Vector.
Finally, we will return this vector.

<div ad note>
  Note

  You could use serde's derive Deserialize for the JSON parsing.
  The problem with this is that the JSON file starts all the object key names with Capital letters,
  and this does not match up with rusts camel case.
</div>

```rust
use serde_json::Value;

fn parse_json(inp: String) -> Option<Vec<Quote>> {
    // Parse the JSON to a `Value`
    let p: Value = serde_json::from_str(&inp).unwrap();

    let mut quotes = Vec::new();

    // Loop through the raw JSON array
    for i in p.as_array().unwrap() {
        // Parse and push the Quotes to the vector
        quotes.push(Quote {
            quote: i["Quote"].as_str()?.to_owned(),
            author: i["Author"].as_str()?.to_owned(),
        });
    }

    // Return the quotes
    Some(quotes)
}
```

### Putting it Together

Now we will add to our main function to load the quotes from the file and parse them.
Then we can start work on the Web Server.

First import `std::fs`, you can also move the `serde_json::Value` import up here.

<div ad tip>
  Tip

  When working with rust use statements, I usually organize them in the following order.
  With newlines separating them.

  - STD Imports
  - External Crate Imports
  - Internal Imports
</div>

Now read the `quotes.json` file as a string and pass it to our `parse_json` function.
Make sure to throw in some nice little print statements!
These look cool and they can help with debugging;
For example, my code loaded `48391 Quotes` and if yours loaded any less, you now know to look into that.

```rust
use std::fs;

use serde_json::Value;

const QUOTE_FILE: &str = "quotes.json";

fn main() {
    println!("[*] Starting");

    let raw_quotes = fs::read_to_string(QUOTE_FILE).unwrap();
    let quotes = parse_json(raw_quotes).unwrap();

    println!("[*] Loaded {} quotes", quotes.len());
}
```

### Web Server

First thing to do is to import `afire::prelude::*`, this automatically imports all the important things.
Then we can create the server, add the (currently unimplemented) route and start the server.

```rust
let mut server = Server::new("localhost", 8080);

server.route(Method::GET, "/quote", |req| unimplemented!());

println!(
    "[*] Starting Server {}:{}",
    server.ip.to_string(),
    server.port
);

server.start().unwrap();
```

If you're then the server and navigate to `http://localhost:8080/quote` you will see:

```
Internal Server Error :/
Error: not implemented
```

So let's fix that!

### Implementing the Route

So the first thing to do is to get / generate the index.
We will use `req.query.get("index")` to try to get the index query parameter.
This can be matched and parsed into an usize if found.
If it's not found, we can randomly pick an index with the rand crate.

Then index`&quotes` to get the quote of that index and craft a JSON response!
Make sure to set the content type to `Content::JSON`.

This is the final route code I came up with:

```rust
server.route(Method::GET, "/quote", move |req| {
    let id = match req.query.get("index") {
        Some(i) => i.parse::<usize>().unwrap(),
        None => rand::thread_rng().gen_range(0..quotes.len()),
    };

    let quote = &quotes[id];

    Response::new()
        .text(format!(
            r#"{{"quote":"{}","author":"{}","id":{}}}"#,
            quote.quote, quote.author, id
        ))
        .content(Content::JSON)
});
```

At this point, everything should be working.
Go ahead, try it out!

- GET /quote
- GET /quote?index=100

### Error Handler

This is an optional step, but I think It makes your API much cleaner.
If there is an error in your route, for example, if someone tries to get index `99999999` afire will automatically return an Internal Server Error.
This is what we saw before implementing the route.

Let's make this error response use JSON to be more consistent with the rest of the API.
This code can be put anyway after creating the server and before starting it.

Using `server.error_handler(|req, err| ...);` you can define basically a route to run on errors.
Here is the error handler I created:

```rust
server.error_handler(|_, err| {
    Response::new()
        .status(500)
        .text(format!(r#"{{"error":"{}"}}"#, err))
        .content(Content::JSON)
});
```

### Final Code

This is the code I had at the end of this.

<details>
<summary>Click to expand</summary>

```rust
use std::fs;

use afire::prelude::*;
use rand::{self, Rng};
use serde_json::Value;

const QUOTE_FILE: &str = "quotes.json";

struct Quote {
    quote: String,
    author: String,
}

fn main() {
    println!("[*] Starting");

    let raw_quotes = fs::read_to_string(QUOTE_FILE).unwrap();
    let quotes = parse_json(raw_quotes).unwrap();

    println!("[*] Loaded {} quotes", quotes.len());

    let mut server = Server::new("localhost", 8818);

    server.error_handler(|_, err| {
        Response::new()
            .status(500)
            .text(format!(r#"{{"error":"{}"}}"#, err))
            .content(Content::JSON)
    });

    server.route(Method::GET, "/quote", move |req| {
        let id = match req.query.get("index") {
            Some(i) => i.parse::<usize>().unwrap(),
            None => rand::thread_rng().gen_range(0..quotes.len()),
        };

        let quote = &quotes[id];

        Response::new()
            .text(format!(
                r#"{{"quote":"{}","author":"{}","id":{}}}"#,
                quote.quote, quote.author, id
            ))
            .content(Content::JSON)
    });

    println!(
        "[*] Starting Server {}:{}",
        server.ip.to_string(),
        server.port
    );

    server.start().unwrap();
}

fn parse_json(inp: String) -> Option<Vec<Quote>> {
    let p: Value = serde_json::from_str(&inp).unwrap();

    let mut quotes = Vec::new();
    for i in p.as_array().unwrap() {
        quotes.push(Quote {
            quote: i["Quote"].as_str()?.to_owned(),
            author: i["Author"].as_str()?.to_owned(),
        });
    }

    Some(quotes)
}

```
</details>

## 🦀 Conclusion

Hopefully you learned something from this.
If you did, make sure to press the like button :p

This website is written with afire, everything from static page serving to APIs to this writing section.
Rust is really a great language for API / backend development because of its *speed* and being compiled significantly reduces the possibility of errors.


[afire]: https://crates.io/crates/afire
[rust-book]: https://doc.rust-lang.org/stable/book/
[kaggle]: https://www.kaggle.com/
[quote-dataset]: https://www.kaggle.com/akmittal/quotes-dataset
