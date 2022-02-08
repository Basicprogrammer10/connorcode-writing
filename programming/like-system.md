@Title = Like System
@Author = Connor Slade
@Date = 02-07-21
@Description = TODO
@Tags = TODO
@Path = programming/like-system
@Assets = .

---

# 🥰 Like System

As you may have noticed, I have recently added a like button and view count to the writing section of my website.
I decided to do this because I want to see how many people actually look at and enjoy my content.

## Overview

So to stay more anonymous, this system doesn't use user accounts or anything. It just uses your client IP.
This has some advantages, but it also has some disadvantages.

The first advantage is that it is much more simple to implement.
You don't need to create and manage any user accounts or anything. You just need to store the client IPs.
The second advantage is that it is more private. No personal information like email or name is stored.
The third advantage is that there is no security risk. You can't leak information that is not there!

The disadvantage is that the view count may not be very accurate.
For example, in places like Schools or Workplaces, different people may be using the same IP address.
So the view count for an article would be lower than the actual number of views.

## Behind the Scenes

So how did I implement this feature? Well, I'm glad you ask!

### The UI

The first step for me (right after planning) is the front end design.
I usually do this because I find it the most challenging and prefer to get it out of the way at the start.

The layout for the view counter was really simple. It's just an eye icon from [Font Awesome](https://fontawesome.com/v4.7/icons/) along with the view number.
I did end up redoing all the CSS for the _meta bar_ as I have started to call it.
This was just to make it more mobile friendly, and now it will put the Views, Reading Time, and date on the next line if it can't fit on the first line with the path.
This is definitely an improvement from before, where it would just hide data that would not fit on the first line.

I had a bit more trouble with the layout of the like button. Originally, I had it in the top right corner of the document container, but that didn't work at all on mobile.
It was absolutely positioned, so it was overlapping with other text, so I had to try something else.
I didn't want to have to require JavaScript just to get basic site layout, so I moved the button down under the main meta bar.
Currently, it looks a bit empty there, so maybe I will add some other buttons in the future to keep it company.

### The _Backend_

For this, I wanted to try using a _real_ database. This proved to be a challenge for me to get it working well enough.
I decided to use SQLite because it was supposedly easy to use and fast enough for small to mid sizes websites.
The API wrapper I picked was the [Rusqlite](https://crates.io/crates/Rusqlite) crate. It looked to be actively maintained and easy to use.

On startup, after opening the database, it uses the following SQL code to initialize the tables.

```sql
CREATE TABLE IF NOT EXISTS article_likes (
  name TEXT NOT NULL,
  ip TEXT NOT NULL,
  date INTEGER NOT NULL,
  UNIQUE(name, ip)
)

CREATE TABLE IF NOT EXISTS article_views (
  name TEXT NOT NULL,
  ip TEXT NOT NULL,
  date INTEGER NOT NULL,
  UNIQUE(name, ip)
)
```

The tables for Views and likes are exactly the same, as both are different for each article and only count once for each IP.
After installation on the tables I set some pragma statements, I will go into this soon!

#### Views

On each article request, I run the following SQL statement.
It will add a view to the article is there is not already one with the same IP and Article.

```sql
INSERT OR IGNORE INTO article_views (name, ip, date) VALUES (?1, ?2, strftime('%s','now'))
```

Next, it gets the view count with this SQL:

```sql
SELECT COUNT(*) FROM article_views WHERE name = ?1
```

The view count can then be formatted into the article page and sent to the client.
It was here when I noticed a big problem with this system. It was _way_ too slow.
The queries (in a commit) were taking `~50ms`. To some this may not seam very long, but lets put it in prospective.
Before, the server was taking in total `~2ms` from the client sending to it receiving the request.
Now because of the database it was 25 times slower.

I opened a discussion on the Rusqlite GitHub repo and eventually found that setting `synchronous` to `NORMAL` massively decreased execution time.
I assume this is because before it was waiting for the operating system to save the database every time.
This is the pragma statement I mentioned before.

#### Likes

Likes are a bit more complicated than views. On each article request, we make the following queries:

```sql
SELECT COUNT(*) FROM article_likes WHERE name = ?1;
SELECT COUNT(*) FROM article_likes WHERE name = ?1 AND ip = ?2;
```

The first query gives how many total likes there are for an article, and the second one tells if the current client is liking the article or not.

Where the likes get more complicated is with the API. Obviously, there needs to be a way to toggle your IPs like state.
To do this, I created a new route at `POST /api/writing/like`. It takes in a JSON body like this one `{"doc": "other/hello-world", "like": true}`.

Then it parses the body and JSON and if like is true it runs the following SQL:

```sql
INSERT OR IGNORE INTO article_likes (name, ip, date) VALUES (?1, ?2, strftime('%s','now'))
```

This is just like the SQL to add a view, but it runs on the likes table.
If like is not true, then it uses this SQL to delete any existing likes from that IP on that article.

```sql
DELETE FROM article_likes where name = ?1 AND ip = ?2
```

## Room for improvement

Now this is big progress for me but as always, it can be made bettor.

Right now, each IP address gets only one view per article. I could improve on this by alloying each IP to add a new view every 20 min to an hour or something.
This would help improve the accuracy of the counter because one person could have many views but not all at once.

Thank you for reading!
I wrote this all surprisingly quickly. I guess I just wanted to tell someone :p
