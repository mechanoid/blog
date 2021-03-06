---
author:
  name: Falk Hoppe
  uri: https://twitter.com/nothing_box
  email: falkhoppe81@gmail.com
title: Progressive Enhancement is no cure to JS exceptions
date: 2016-03-31
category: frontend architecture
tldr: Progressive Enhancement is not saving you from making errors, and your application may have major outages if you let them crawl into production, whether you want it to be true or not. Yes, SPAs have this problem, because they naturally rely heavily on JS, but so do modern progressively enhanced webapps.
---

## Progressive Enhancement is not a cure to everything

Since Single Page Apps came up, there has been (for good and many reasons) a community discussing the disadvantages of SPAs and where they have failed.
At latest since the ["Gawker"-incident](http://www.webmonkey.com/2011/02/gawker-learns-the-hard-way-why-hash-bang-urls-are-evil/) a few years ago a big argument that is spread into each and every discussion about SPAs versus its older counterpart Progressive Enhancement is the *white-page* nightmare and that single javascript errors can kick your page in the groins.

Once you search for *Progressive Enhancement vs. Single Page App* and *white page* and similar you will find a bunch of articles, that buy in into this argument, like [here](https://www.leaseweb.com/labs/2013/07/10-very-good-reasons-to-stop-using-javascript/), [here](http://programmers.stackexchange.com/questions/237537/progressive-enhancement-vs-single-page-apps#comment546103_238021) or [here](https://www.christianheilmann.com/2011/12/28/on-single-page-apps/).
I only gave it a quick shot, but you may find several maybe better examples for what I mean.

Recently I saw this again in an awesome [article](https://www.smashingmagazine.com/2015/12/reimagining-single-page-applications-progressive-enhancement) about a clean and simple "alternative" for smaller pages, that want to have a SPA like behavior. In fact this blog itself uses some of these techniques, because I think it is really awesome and wanted to play with it (weather you like it or not 😋).

And while I love writing Web-Applications that rely on Progressive Enhancement, I gave Single Page Applications a chance too, and guess what? Both, SPAs and PE-Apps have the same problems about JavaScript exceptions. Handling exceptions is not an easy task, and yes you can f\*ck it up in both worlds. While SPAs are often crashing totally, leaving us with a blank page, or having to do a big job in isomorphic content delivery, progressive enhanced apps may have a big problem too.

- Yes the "blank page" problem is a major problem that i don't want to talk down, but the SPA folks have solutions for that (most of the time I don't like them, but ok). In case you are concerned about that, or want to have some examples on why PE does not suck in that place, maybe you should give a look at this [blog](http://sighjavascript.tumblr.com/).

In discussions about those architectural choices I often hear people referring to the invulnerability of progressive enhanced apps with something like:

> applications build in a right manner, just work with or without JS, so they are much better than SPAs

While I think that this is true in a matter, that you can do a lot for a more robust, accessible and in general well designed application, I think that some people have missed a point here. PE is at some point a question of 'does my app work without JS', but for me the reason is not, that it will outlive severe script exceptions.

If you have an application, that is enhanced with JavaScript, your application may become unusable by suffering from a severe exception. By comparing the JS of SPAs and progressively enhanced applications you very probably will find some lines in both code bases, that may cause the site to be not in a working state anymore in case such an error happens. This means the user is left in a state where he not able to use the page in a reasonable manner any more. You may say, ok, but at least he can see the websites content still, but does that really matter anymore at that point? Your side has become a fancy and really expensive sheet of paper, just not that useful.

An easy example would be to sabotage a "remote form" script that sends the data asynchronously to the server. It for sure catches all submits, maybe validates all fields in beforehand and so on. Maybe the same script also does something like [pjax](https://github.com/defunkt/jquery-pjax) or [turbolinks](https://github.com/rails/turbolinks) and asyncyfies your GET-links.

If there is a bug, an error injected by js compression of your provide or what else conundrum there is, it will turn your site in a rather useless pile of crap.

## So what's the cure?

Basically Progressive Enhancement may be able to give you a better shot to tackle those kind of problems. By starting out with a straight request/response web application, enhancing every feature in a [cutting-the-mustard](http://responsivenews.co.uk/post/18948466399/cutting-the-mustard) manner you may be hardened against many problems, that still would hit you hard running the usual SPA frameworks. But i don't think that you are immune to described problems at this point.

So, whats now? Give up and write JS-only apps? Yes, maybe, or at least you should think about a few things before start sprinkling your boring app with magical javascripty stardust.

- **is my functionality important or is it ok if it fails until i can deploy a proper bug fix?**
- **do i increase the value of the given function for the user?**
- **am i able to improve the User Experience in a different way?**

If you have already thought about such questions i think you should walk the path of bringing in JS. Finally it is the combination of HTML, CSS and also JS that lets people create awesome web experiences. Ok and so what? What can we do to avoid or minimize the impact of this kind of big bang exceptions.

First point is easy, **testing**, **testing**, **testing**! The time of script kiddies, wielding the *Staff of Power*, doing all the magic is so over right now. If you want to write an application, that should provide anything of value, it should have tests. The more people rely on your work, the more tests you should have. This for sure is both true for SPA applications and progressively enhanced applications.

A maybe good argument for SPAs, that comes by from time to time is that they help to form a nice server API. In my opinion there is no reason why you should not be able to do this with a PE app. The matter here is in fact and a good argument for PE apps is that usually you are enhancing your application step by step, and you have the choice to remove those enhancements if it just doesn't work out. So what happens if a JS exception made it to production and kills your remote form? If you have built it in a proper way try to just remove this functionality for a time and give your users the chance to use your app again. The user experience may be not the shiny golden star you have dreamed of, but your customers will have the chance to buy your product, use your service, and so on.
