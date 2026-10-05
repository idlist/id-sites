---
lang: "en"
title: "Things you are not gonna need in your blog"
route: "redundant-things-in-blog"
created: 2026-10-05
---

As a guy who has rewritten his homepage 7 times and his blog at least 3 times, I want to share some of my insight about having and maintaining a blog. This perspective is purely personal, and you are free to agree or disagree.

As humans, we all have some sort of urge to express ourselves, more or less. Some of us would consider starting a blog, using an existing service or hosting a template. I'm one of the guys who once really wanted to build a blog from scratch.

In the old times when Astro wasn't a thing, building a blog didn't have many options. Wordpress, Hexo, Hugo, Eleventy... Those are either heavy CMSes or heavily relying on existing templates, and I still can't understand how to "build from scratch" even though I have read all the documents (I guess I still don't know now).

Then I thought: how about just building a blog generator on my own based on Node.js? It takes me nearly 1 month to make it ~~and I guess no one really believes I actually made it~~, and while it has all the features I envisioned (i18n, tags, archives, etc.),  it has bugs here and there, and can barely run.

## You are not gonna write a bunch of articles

Then here's the point: after finishing building the blog, I didn't really write any articles for a year. Or more. The blog is just empty, and keeps being empty for a really, really long time.

It's kind of obvious if you take the actual time of writing an article into consideration. A short essay might cost a night, and a post with concrete topics and contents might simply take away a whole day. Let's say you write a post every week, then there would be about 52 posts when the year passes, which...isn't really a lot. If you list their titles in a single page, it wouldn't be as long as you imagine. And for most of us whose main focus isn't solely on writing blogs, even one post a week can already be a huge burden.

## Tags, categories, timelines, archive...

...you would not really need those features if you are coding your own blog. If you're using a service or template, and they already had those features, then it's okay; but if you're creating them on your own, then just don't do it at the early stage.

There are two main reasons for this. One reason is that as I described above, you are probably **not** gonna write a lot of articles, and those features only become useful when you really have *a lot of* posts, at least hundreds or so. Think about a blog with only 5 posts, each catalogue having one or two posts, you'll agree that those catalogues don't really make much sense.

The other reason is that those systems can **negatively** impact your motivation. When you start composing a new post, you would also start thinking about which tags the post is going to have, or which category it is going to belong to. In other words, the blog tends to converge into several themes when these features are presented in the first place, even though this might not be your intent. Then, what if you suddenly want to write a post that would not belong to any of the themes? You'll probably end up not writing it. That's what happened to me. Archiving by time isn't a good idea, either: it induces hidden anxiety in the form of being obligated to post on a regular basis, while the reality is that sometimes you are just not in the mood to write posts.

I'm not purely against having those features, though. For example, if your collection of articles is already large, then having tags or categories can be nice and handy for your readers. What I do not recommend is to develop them only because you want to implement those functions, or because other blogs have them. Especially in the scenario of coding your *own* blog, it's not necessary to take those "common features" of the blogs you see on the Internet for granted: you already have the finest grained control over your blog, so that you do not really need to reinvent the same catalogue system the common ones have. It would be nicer to think about how to list and group your articles in your own way, fitting your own style.

## You should know when you set up area for discussion...

...you are ready for the opposing voices. Many people set up a discussion area for each of their posts just because other blogs do so, and again, I'd like to say it's more of a bandwagon practice. I'm not stopping you from doing this; I'm pointing out that you are **not** as prepared to face those contrary opinions as you think. One "bad" comment from others can easily make a bad day or even a bad week for you, preventing you from writing something again for months.

Another fact that we all know but few are willing to face is that no one would really comment on your post, especially for self-hosted blogs. Having a bustling discussion section is a beautiful illusion we don't want to shatter. Don't worry about the rare cases of someone want to discuss something with you, as if they truly want to do so, they will find a way by themselves.

## Cut things off when your passion fades

Although I have reasoned about many "don'ts", I also know it would not have much effect overall, even to myself. Fair enough if you think you're different from what I've described, or you have the ambition to keep things going. Most of all, building a blog itself is fun, and implementing a feature from nothing is the source of achievement. It's totally fine to go with our passion, as that's the most precious fuel to push us closer to our ideal selves.

However, no matter how we try to protect or refuel our passion, we must accept that one day it might dissipate. When you start to feel that maintaining those features stops being fun and becomes more of a burden, it is time to reconsider whether you built those features for concrete purposes, or purely by passion. Feel free to **cut things off** when your passion struggles to sustain your original vision: it's not a shame, it's pragmatism.

The things you cut off do not disappear completely; they're the basis for enhancing our understanding of what we truly want, and what is truly useful. My old blog with not many posts and bloated features have accompanied me for a long time, and in this first post of the new blog, I want to say a nice goodbye to it: you've done your job, and now it's again a new start.
