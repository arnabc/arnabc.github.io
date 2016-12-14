---
layout: post
title: "PhoneGap - How does it work"
date: 2011-12-05 00:47
comments: true
categories: [phonegap, Mobile apps, HTML5] 
author: Arnab
---

PhoneGap is an open-source cross-platform Mobile Application development framework by Nitobi Software (now Adobe) which allows web developers to build mobile apps using HTML, CSS and JavaScript. 

The PhoneGap project has been moved to Apache Incubator and now it is known as "Apache Callback". PhoneGap project is divided into several sub-projects where each one represents a separate platform. In order to develop for iPhone and iPad, you need Mac OSX and XCode installed, similarly for Android you need Google Android SDK, Eclipse ADT Plugin, Ant as well as Eclipse IDE. 

The official project detail can be found here [Apache Cordova](http://cordova.apache.org/ "Apache Cordova/PhoneGap"). ~~It is currently hosted in GitHub and once the Apache infrastructure is ready it will be moved there.~~

<!--more-->

## Supported Platforms
PhoneGap supports several mobile platforms, which enables web developers to write code using their existing HTML/JS skills and deploy to multiple platforms:

* iOS (iPhone/iPad)
* Android
* Symbian
* BlackBerry
* WebOS (most likely dead - go blame HP)
* WP7
* Samsung Bada

The environment setup for each of the above mentioned platforms can be found in ["Getting Started"](http://phonegap.com/start/ "Getting Started with PhoneGap").


## Architecture
PhoneGap is not a "native application development" framework, even though it provides access through several device features using an abstraction layer, which otherwise are inaccessible to a normal webpage. In simple words, it provies a "WebView" with extended capabilities. Using PhoneGap one can access the following device features:

* Camera
* Geolocation
* Compass
* Contacts
* Media
* Accelerometer
* Network
* Notification
* Storage
* Filesystem
* etc...


The following diagram explains how does a PhoneGap architecture look like:

![PhoneGap Architecture](/images/phonegap-architecture.jpg)

In the above dialogram we can see that PhoneGap provides a "WebView" which is nothing but a bare bone web browser without a Chrome UI. The native code in PhoneGap SDK exposes uniform APIs across multiple device platforms which are accessible to JavaScript running inside the WebView. 

As a web developer if you are using PhoneGap then it's less likely that you'll need to know the internals of the SDK (although it is always recommended to go through the source code in case you want to enlighten yourself as well as get fascinated by the tremendous efforts that the PhoneGap developers have put into it)


## How to approach PhoneGap development
Even though you're using HTML/CSS and JavaScript to develop applications, remember that it's not a traditional desktop browser environment and the user experience pattern is significantly different. The PhoneGap apps are downloadable from App Store, so user might not know(or they don't even care) that your app is built using PhoneGap or HTML/CSS, it's always a good practice to be consistent with the platform UI guidelines so that you don't confuse your users. A simple example could be if you're developing a PhoneGap app for Android then be sure to handle the hardware/software(ICS) "back key", if you don't do that then your users might get confused.

Another important factor is handling scaling and device orientation, you should always make sure that your app looks proper in both Portrait and Landscape orientations.


The recommended way to start PhoneGap development is below:

- Setup environment for the target platform for example iOS/Android etc, see [Getting Started](http://phonegap.com/start/).
- Run the sample app provided with the PhoneGap SDK.
- Go though the [API Documentation](http://docs.phonegap.com/ "PhoneGap API Documentation").
- Try creating sample apps of your own using each of the device features available through the PhoneGap API.
- Once you are familiar with PhoneGap, try creating a sample app which uses multiple device APIs, you can try using jQuery Mobile, Sencha, Jo HTML5 Mobile App or jQTouch) to build the Phone like user interface.


## Limitations
PhoneGap as development platform is very attractive and promises to bring uniformity across several mobile platforms. It aims to become a de facto mobile application development framework using HTML5 based technologies. But as said above the capabilities offered by the framework is limited to what a "WebView" can do. The following are a list of things to watch out for:

* In iOS the WebView is not JIT enabled (however the actual iPhone browser is), which means the JS code can't take advantage of the engine optimizations which are otherwise available to actual browser of the device.
* In Android the CSS rendering in WebView is not as par with iOS, the rounded corners often look jagged.
* The WebView runs with limited amount of memory, be sure to optimize your JS code so that it doesn't cause trouble.
* If you are developing for multiple platforms, make sure that you're aware of the capabilities available in that platform, for example - in latest iOS you can use WebSocket but in Android it's not yet available (not confirmed in ICS though).
* PhoneGap has good support from BlackBerry 6.0+ (with WebWorks SDK), phones with older BlackBerry versions may not work as expected.


## Security
As your app runs inside WebView (aka a browser), you should not allow untrusted third-party code to execute in the page, because this can compromize the security, the JS code downloaded from internet will suddenly have access to several device features that they can make substantial damage to user's privacy and security. Do not load an iFrame in your app, or redirect to some other websites when the app is loaded, as this will likely get your app rejected in Apple app store, beacuse Apple does not like applications opening public websites inside the app as it makes it difficult or almost impossible to enforce policies regarding content. 


## Resources
The following resouces can be useful for HTML5 based mobile apps development (not all are related to PhoneGap):

* [jQuery Mobile](http://jquerymobile.com)
* [Jo HTML5 App Framework](http://joapp.com)
* [Sencha Touch - Commercial](http://www.sencha.com/products/touch)
* [jQTouch](http://jqtouch.com)
* [AppMobi](http://appmobi.com)
* [DHTMLX Touch](http://dhtmlx.com/touch/)
* [NimbleKit - iOS only Commercial](http://www.nimblekit.com/)
* [The M-Project](http://www.the-m-project.org/)
* [Wink Toolkit](http://www.winktoolkit.org/)
* [Zepto.js - JavaScript library for Webkit browsers](http://zeptojs.com)
* [Backbone.JS - JavaScript MVC framework](http://backbonejs.org/)


## Conclusion

PhoneGap provides an opportunity to a vast pool of web developers reusing their existing skills to develop applications for mobile phones, which in future is going to be one of the most important medium to access information and content in internet. As the phones become more powerful, the new capabilities will be available in your arsenal. The recent developments in HTML5 based technologies also usher a new change in this segment. Do not miss the bus and keep exploring PhoneGap.
