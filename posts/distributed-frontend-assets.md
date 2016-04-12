---
author:
  name: Falk Hoppe
  uri: https://twitter.com/nothing_box
  email: falkhoppe81@gmail.com
title: Distributed Frontend Assets
date: 2016-04-09
category: frontend architecture
tldr: In my opinion there is a certain similarity between centralized asset deployment to distributed services and distribution of data to decentralized storages. In consequence of that some rules of data distribution may be applicable to the field of asset distribution. In this post I concentrate on a relationship between how to integrate centralized assets and Eric Brewers CAP theorem.
---

In recent projects I noticed some interesting parts about frontend development that emerge from the circumstance of app development in a distributed services environment.

A distributed service environment in this case means, that we have a few applications that provide frontends based on modern web technologies. Whether we are talking about micro services or larger systems like [SCS](http://scs-architecture.org) doesn't matter here. More important is the fact, that we have different services that should look more or less similar to a visitor. For example lets imagine an e-commerce platform with several small services, one delivering the main page and its content, one serving the user registration and signup and one that handles the orders coming in from our customers.

Because your apps are part of an integrated system it is usually a good decision to say that the application while presenting individual business cases should share a common look and feel too. With this requirement in place there are mainly three different approaches of how to integrate the services in the frontend.

**no integration - don't share, rebuild!**

The "easiest" approach and for sure the one with the biggest effort, at least when it comes to a certain complexity, is to build a common look in each application itself. This is mainly done by just taking a central style guide which specifies the goal, but not sharing a line of code to retrieve the same results.

This approach is for example often the only choice when different technologies are used to create the same look and feel, just think about a native app and a web app. But while there are cases where you have no choice to properly integrate your apps, we usually want to have a more [DRY](https://en.wikipedia.org/wiki/Don't_repeat_yourself) way for building our frontend code.

So usually we end up using a different more centralized approach. Instead of building a style guide, that just tells people how the services should look like it is a much better idea to build a centralized pattern library that is shipped along with the style guide.

Ok, we have the requirement of all applications should share the same look and feel, so we have build a central library that ships all common frontend components. Aren't we done yet?
Not really, now that we have decided for a centralized solution we have to decide how the response of an incoming web request is equipped with our styles and scripts.

**push integration - all the same, immediately**

In most projects there is one requirement that sneaks in together with others side by side. If you ask some people about that requirement most people cannot even answer who brought it in. It is the requirement, that all services should look the same, all the time. If I change and deploy the color of a link inside the central library, the font-size of a headline or similar, each service should receive those changes immediately at runtime without extra deployments.

The ability of providing assets to services, updating all of them at the same time can be achieved with different techniques and in my opinion each of them has its certain drawbacks. But in general  it comes down to "you are changing the state of the deployed service at run time and violate its independency". So a team which builds and runs the service is no longer in full responsibility alone if it comes to erroneous behavior in production.  

A simplistic approach to implement this behavior is to include a non versioned reference for example to `main.js` or `main.css` in a central CDN and exchange the file contents of those files in new asset deployment. Because that technique ignores the matter of browser caching we usually append fingerprints of the file contents to the deployed files.
One way to still achieve our immediate update behavior may be to inject the asset references via [ESI](https://www.akamai.com/us/en/support/esi.jsp) or any other way of post-deployment link resolution technique.

I don't want to say, that there aren't cases where the extra overhead of dynamic asset resolution isn't justified, but it is rarely discussed before people start to implement the necessary infrastructure.

**pull integration - one at a time**

An approach that sounds more reasonable to me especially if services should be developed independently is to include the central pattern library like any other external libraries at build time. Therefore it makes sense to provide the assets semantically versioned side by side to older versions, so that a service can decide which to use at build time.

Whether your assets in a given version are physically bundled into the build artifact or are included as fixed reference to that version doesn't really matter for this integration approach. The important thing is, that the reference to a newer asset version can only be injected at build time.

Imagine your assets for example provided as npm-package, gem, webjar or whatever and you have to rebuild your application to resolve to the next asset version.

This approach of handling asset resolution has for sure its drawbacks too. At first you have to re-deploy an application to let it shine in a new frontend version. But maybe more important is the fact that apps are by definition out of sync now.

The main advantage which makes this approach my personal favorite is, that deciding for a determined asset version in the build step means that it becomes tested together with any changes made in the service itself. So a team developing a service is able to decide if it can ship the next asset version without breaking any functionality. So responsibility is back where it belongs to.


## Asset-changes as distributed data

Ok, now that we made it through the ground work, lets talk about the funny things. The one or the other may have noticed the thing  that I really want to talk about.

If we look at new asset versions in a little bit different way we can see a similarity to a different software principle in the area of distributed systems. Lets take the changeset included in an asset release and assume its just data we publish to a distributed storage. Once the data is deployed to a storage entity (our service) the data becomes available/visible to a user in his next request.

When we look at our asset deployment like that we can see that the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), a very important theory about distributed data can be applied to our domain.

CAP an acronym for Consistency, Availability and Partition tolerance says that if you want to store data in different locations you have to choose two of those properties and you will have lack of the third. (For further information about the theory itself, please have a look at the various articles explaining how the CAP Theorem works exactly, because that would go far beyond the horizon of this article)

To get a hint about what that tells us about our asset distribution lets talk about the CAP properties and what they mean for our use case.

## Consistency

Consistency is a property that has usually the biggest awareness amongst frontend developers and designers. It is easily explained by considering a very practical example. Lets assume that our services each include a brand logo at the top of their starting pages. A new asset release now includes an updated graphic for that image. The services are consistent if they provide the same version of that file to new page requests. So this property describes the uniformity in look and feel of our services.

## Availability

Availability is dedicated to the question of "is the service able to deliver some asset version". So applied to our logo example, do our services have access to the versions of our logo, (not necessarily the same) and are the services able to deliver it to a request without errors.

## Partition Tolerance

Partition Tolerance is all about the possibility to distribute our asset data to different services while centralizing or sharing the data itself. So is it possible to centralize our asset data and share it between our services.

## Integration variants and CAP

Now that we have an idea about what to look at we can take a closer look at our 3 different integration scenarios. As mentioned before, when we want to decide for a strategy we have to specify which 2 properties of the CAP theorem we want to support foremost and which of them we consider as not so important.

### No-Integration

The first one is very easy. We defined that each service is responsible for itself and for how far it implements a "common" look and feel.

So because we decided to not share a bit of code, partition tolerance is not part of our system, but each service is responsible for providing its assets, so the services are 100% **consistent** to themselves and because there is no intermediate  in the distribution process, the assets are always **available**.

That scenario seems pretty bad for most occasions like building an e-commerce system or anything where a customer expects a consistent user experience. But for sure there are problem fields where it is much more important to have almost no coupling between services and the look and feel is a mere nice to have.

### Push-Principle

At next we defined a scenario where new asset versions are deployed centrally once and become applied to our services in parallel and immediate.

This means that in this approach the strongest feature is for sure **consistency** by sharing our code between services so as a result we decided for **partition tolerance** as well. Up from the moment we deploy a new style or js-functionality or something like that we "push" it into each service and force new requests to that services to deliver the updated version. So changes are visible immediately and the services deliver a consistent look and feel all the time.

The problem in this distribution scenario lies in the strict coupling of our services now. Each central asset deployment delivers code that is able to corrupt a service at runtime. Not more or less. So availability becomes a major issue in this system.

### Pull-Principle

Last but not least we are left with the approach that concentrates on the last valid combination of our properties.

By integrating assets (or the referencing them) in our services at build time we decided for an improved service **availability** by still sharing our assets in a central repository, so **partition tolerance** is part of our model here. Consistency is by definition the loser in this scenario or at least we decided for something like an eventual consistent system in terms of distributed data science.

So yes our systems will be out of sync from time to time, but therefore we achieve a greater robustness to errors in the distribution process. A new assets version can be tested in our build pipeline and will not change its behavior once it is deployed.

## Summary

In this article I don't want to judge any of these strategies at all, it is more about clarifying that our asset deployment is equipped with the properties we decide for.

So it may make sense to think about the properties you are interested in first, before deciding for an actual implementation.

Personally I end often as a fan of the **pull** scenario, because I think that **consistency** is a property that is for sure important but not life-saving. In a distributed service environment I want to share code, I don't want to repeat myself over and over but for sure I don't want to decrease the robustness of my systems just to have an optimized comfortability at development time.

For what scenario you decide is still a matter of your personal preferences and obviously a matter of your requirements. So analyze and choose the right solution for your product.
