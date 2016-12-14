---
layout: post
title: "Developing Kiosk Mode Applications in Android"
date: 2013-11-17 11:40
description: The overview of developing kiosk-mode applications in Android which is always the default app to be used by the user.
keywords: Android, Kiosk-mode, Homescreen, Launcher
comments: true
published: true
categories: Android Kiosk-Mode Homescreen
---

I have had my fair share of developing "Kiosk Mode" or "Single Application Mode" applications for Android. The idea is to run only one custom app and prevent any other applications to run (or only whitelisted applications). In this blog post I would like to share the approaches that you can take and the possible challenges you'll face while developing these type of applications. This is a high-level overview of the effort involved, and not meant to provide code examples which will be beyond the scope of the post.
<!--more-->

## General requirements for such applications
* Only one app is allowed to run.
* Only whitelisted contacts are allowed to be contacted (via Phone or SMS)
* Only whitelisted apps are allowed to be used.
* Tracking which applications are installed or uninstalled.
* Disable status bar.

## Things to consider before developing the app
* Developing for the masses? Will it be distributed through the Play store ? Not a good use case for Kiosk mode applications IMHO don't do it, users don't like it when you take over their phone and don't allow them to use the phone freely. Might work for a very specific niche for example a mounted Tablet in a restaurant which displays today's menus and recipes.
* If you are developing it for controlled distribution, not through the Play store, then finalize the type of devices which will be used to distribute your app. Most common scenario is that it will be a cheap Chinese tablet running either Android 4.0+. Get familiar with the device first, figure out how many hardware keys are there and which ones you need to block or modify.
* Savvy users can bypass your restrictions if the devices are not physically secured. Although nothing in this world is completely secure so always watch out for surprises.

**My focus on this post will be controlled distribution where you as a developer have physical control over the devices.**

## Approaches for developing Kiosk Mode applications
Following are the two approaches that you can take depending on your expertise and skill.

* Developing as a Launcher application
* Building a custom ROM


## Developing as a Launcher Application
This approach is the easiest one that you can take, developing a Launcher application is fairly simple and you can quickly get going without much of a trouble. Let me roughly list out the items which you need to do:

#### Only your app is allowed to run always
As mentioned above make it a Launcher app and ensure that it is the default launcher app, after installation you can disable the old launcher app using ```pm disable <PACKAGE_OR_COMPONENT>``` command. Now as your launcher app is the default one so it will be started automatically on boot, nothing fancy here.

#### Detect when new applications are opened
In order to enforce control, you may need to detect when a new application is opened to figure out whether it is an allowed application or not. There are two ways that you can go about it:
 
* Run a repeated alarm, for example every 5 seconds and retrieve the topmost activity from the currently running applications and and see if that package is allowed to run if not then bring your home screen in the foreground and use ```ActivityManager.killBackgroundProcess()``` to kill that app (will not work for system apps though). There are caveats to this approach, it is heavy on resources and drains battery very quickly.
* Use **AccessibilityService** and it lets you know when a new application window is opened and then you can check which application is currently running and act accordingly. This is on demand and is not heavy on resources. The caveat is that you have to manually enable the service from ```Settings --> Accessibility```. Assuming physical control over the devices, so this should not be an issue, but it's manual and that's the downside.

#### Detect if new applications are installed or uninstalled
Android provides broadcast receivers for you to track when a new application is installed or uninstalled. Use them and log the activities accordingly.

#### Disable status bar
You cannot override the status bar,  so the only option is to run a background service and create a opaque overlay view and position it on top of the status bar, this status bar should consume all touch events (this is how custom status bar replacements apps work I think), you'll need ```android.permission.SYSTEM_ALERT_WINDOW``` permission to put your view on top of all other windows. Also you can make your Launcher app fullscreen as well.

#### Make your app a Device Administrator
Take advantage of Device Administrator features, this will provide some elevated access rights to perform administrative tasks, like remotely lock screen, wipe out the data etc.


#### Automatic Update
If you need automatic update support but don't want to distribute your app through Play Store, then you need to "**root**" the device and run a separate app which will update your app when there is a new version. This requires you to build a backend as well. I wrote a blog post on this topic some time ago, [Android auto-updating homescreen application](/blog/2012/01/android-auto-updating-homescreen-application/).

## Building a custom ROM
This is by far the most preferable and a reliable approach. You can create your custom build right out of AOSP source code, but based on your device you will need some proprietary files. Take a look at the AOKP/CynogenMod for custom ROMS for your device.

Building custom ROM is bit difficult as it will take you some time to fully grok the process but once you're through with this, then it will be alright. I suggest you try building a custom ROM from vanilla AOSP source and test it in Emulator using Virtual Device. It will also be a very good learning exercise for you.

You need to build your own backend infrastructure for distribution and remote management.

## Conclusion 
Developing kiosk based applications are difficult but not impossible, the problem begins when you start to control the device's default functions, if you see that you need to completely lock-down a device then it is wiser that you go down the custom ROM path instead of trying to make it work in consumer grade Android phones.


---
Note: I have developed a generic Kiosk Management Solution called [MobiLock Pro](https://mobilock.in) which has the above functionality as well as many other features. If you want to have a fully managed Cloud Based Kiosk solution then do check out **MobiLock Pro**.
---
