---
author:
  name: Falk Hoppe
  uri: https://twitter.com/nothing_box
  email: falkhoppe81@gmail.com
title: Progressive Enhancement is no cure to JS exceptions
date: 2016-01-10
category: frontend architecture
tldr: Progressive enhancement is not saving you from making errors, and your application may have major outages if you let them crawl into production, whether you want it to be true or not. Yes SPAs have this problem, because they naturally rely heavily on js, but so do modern progressively enhanced webapps.
---

## Progressive Enhancement is not a cure to everything

Since Single Page Apps came up, there is (for good and many reasons) a community discussing the disadvantages of SPAs and where they have failed.
One big argument that is spread into each and every discussion about SPAs versus its older counterpart Progressive enhancement is
the *white-page* nightmare and that single javascript errors can kick your page in the groins. Once you search for *progressive enhancement vs. single page app* and *white page* and similar you will find a bunch of articles, that buy in into this argument, like [here](https://www.leaseweb.com/labs/2013/07/10-very-good-reasons-to-stop-using-javascript/), [here](http://programmers.stackexchange.com/questions/237537/progressive-enhancement-vs-single-page-apps#comment546103_238021) and [here](https://www.christianheilmann.com/2011/12/28/on-single-page-apps/).
I only gave it a quick shot, but you may find several maybe better examples for what i mean.

Recently i saw this again in an awesome [article](https://www.smashingmagazine.com/2015/12/reimagining-single-page-applications-progressive-enhancement) about a clean and simple "alternative" for smaller pages, that want to have a SPA like behavior. In fact this blog uses some of this techniques, because i think it is really awesome and wanted to play with it (weather you like it or not 😋).

And while i love writing Web-Applications that rely on progressive enhancement, i gave single page applications a chance too, and guess what? Both, SPAs and PE-Apps have the same problems about javascript exceptions. Handling exceptions is not an easy task, and yes you can f*ck it up in both worlds. While SPAs are often crashing totally, leaving us with a blank page, or having to do a big job in isomorphic content delivery, progressive enhanced apps may have a big problem too.

Yes the "blank page" problem is a problem, but the SPA folks have solutions for that (mostly i don't like them, but ok). If you are concerned about that, or want to have some examples on why PE does not suck in that place, maybe give a look at this [blog](http://sighjavascript.tumblr.com/).

In discussions about those architectural choices i often hear people referring to the invulnerability of progressive enhanced apps, with something like:

> applications build in a right manner, just work with or without js, so they are much better than SPAs

While i have the opinion that this is true, in the matter, that you can do a lot for a more robust, accessible and in general well designed application, i think that some people have missed a point here. PE is at some point a question of 'does my app work without js', but for me the reason is not, that it will outlive  severe script exceptions.

If you have an application, that is enhanced with javascript, your application may become unusable if you make a severe error. By comparing the JS of SPAs and progressively enhanced applications you will find in both code bases some lines, that may cause the site to be not in a state anymore, so that users can interact with it, without tearing their hair.

An easy example would be to sabotage a "remote form" script, that sends the data asynchronously to the server. It for sure catches all submits, maybe validates all fields in beforehand and so on. Maybe the same script also does something like [pjax](https://github.com/defunkt/jquery-pjax), or [turbolinks](https://github.com/rails/turbolinks) and asyncyfies your GET-links.

If there is a bug, an error, or what else conundrum there is, it can blow up your page.

## What is the cure?

If you ask me, what architecture will fit better, or what you should do, for me the answer is easy. **testing**, **testing**, **testing**! The time of script kiddies, wielding the *Staff of Power*, doing all the magic is so over right now. If you want to write an application, that should provide anything of worth, it should have tests. The more people rely on your work, the more tests you should have.

A maybe good argument for SPAs, that came often to me, is that they help to form a nice server API. In my opinion a progressive enhanced app is a good to go for writing robust web applications. The matter here is in fact, that usually you are enhancing your application step by step, and you have the choice to remove those enhancements if it just does not work out.

So what happens if a js exception made it to production and kills your remote form? If you build it wise, just remove this functionality for a time, and give your users the chance to use your app again. The user experience may be not the shiny golden star you have dreamed of, but your customers will have the chance to by your product, use your service, and so on.
