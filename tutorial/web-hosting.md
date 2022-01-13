@Title = Tutorial: Hosting a Web app
@Author = Connor Slade
@Date = 01-13-21
@Description = Learn how to host a web app with a reverse proxy on Vultr.
@Tags = Website, Web app, Vultr, Nginx
@Path = tutorial/web-hosting
@Assets = .

---

# 🐍Tutorial: Hosting a Web app

Around 576,000 new websites are created every signal day. So lets see how to host one on your own.
This article is about site hosting, not creation so this assumes that you already have a website.

### 🎯 Getting a Domain

This is an optional step but is important if you want a TLS certificate or just to have a more memorable way to access your site.
A domain is an Intensifier that (through the DNS system) links to the IP address of your web server.
This article wont really touch much on obtaining a domain or setting up DNS.

### 🐕‍🦺 Getting a Server

For this step we will use Vultr for a virtual Private Server or VPS.
So go to [vultr.com](https://www.vultr.com/?ref=8859764) and create an account.
