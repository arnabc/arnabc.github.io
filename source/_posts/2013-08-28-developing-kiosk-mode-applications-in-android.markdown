---
layout: post
title: "Developing Kiosk Mode Applications in Android"
date: 2013-08-28 19:07
comments: true
published: false
categories: Android Kiosk-Mode Homescreen
---

I have had my fair share of developing "Kiosk Mode" or "Single Application Mode" applications for Android. The idea is to run only one custom app and prevent any other applications to run (or only whitelisted applications). In this blog post I would like to share the approaches that you can take and the possible challenges that you'll face when developing these applications. 
<!--more-->

## Things to consider before developing the app
* Developing for the masses? Will be distributed through the Play store ? Not a good use case for Kiosk mode applications IMHO don't do it, I know their are applications out there on Play store and I also know how to bypass them. Might work for a very specific need for example ToddlerLock app.
* If you are developing it for controlled distribution, not through the Play store, then finalize the type of devices which will be used to distribute your app. Most common scenario is that it will be a cheap Chinese made tablet with either Android 2.2+ or Android 4.0+. Get familiar with the device first, figure out how many hardware keys are there and how can you block or modify them.
* Savvy users can bypass your restriction. Nothing in this world is completely secure so always watch out for surprises.

**Note:** I will mainly focus on controlled distribution where you as a developer has physical control over the devices, developing such applications for common people to use on their phones and tablet is not ideal IMHO and I don't want to deal with that because it is too complicated and does not work most of the time.

## Approaches for developing Kiosk Mode applications

Following are the two approaches that you can take depending on your expertise and skill.

* Developing as a Launcher application
* Building a custom ROM


### Developing as a Launcher Application
This approach is the easiest one that you can take, developing a Launcher application is fairly easy and you can get going quickly without much of a trouble. Let me roughly list out the items which are important for developing Kiosk mode applications:

* Only your app is allowed run at any given point of time or a set of whitelisted applications (ideally developed by you) are allowed to run.
* 






## Conclusion 
I hope you don't have to develop these apps ever because it is so complicated and plagued by device incompatibilities that it will take the joy out of your development, you'll end up putting hack after hack and would spend enormous energy to make it work if you are to distribute your app through Play store. If you are aiming for a controlled distribution where you decide which device should be used, then it will be less painful.

