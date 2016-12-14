---
layout: post
title: "Android auto-updating homescreen application"
description: Android automatically update homescreen application not distributed through Google Android Marketplace.
date: 2012-01-21 00:26
comments: true
categories: [Android, Java, Automatic update, Homescreen Apps, Content Sync]
---

Well, the title of the post may not be descriptive enough of the complexity that we dealt with in one of our recent projects. Before I delve deeper into the actual problem, let me give you some background of what we're trying to achieve. We've been working on an Android application for some time which is going to be installed in kiosks or in cabs mainly on Android tablets (currently Android 2.2 devices), basically this is a sort of in-cab entertainment system where you can listen to music, watch videos, latest movie trailers and promos, read latest news, search places and find them in maps. You may think what's so complicated about it? Well this app is an Android Homescreen application and this is going to be the only application that users can access from the tablets and above all it'll be **remotely managed**. 

The term **remotely managed** means that the app will be automatically updated over the air, there will be a provisioning server where the admins can publish/upload a new build, and that build will automatically be installed in the devices. Other than that the device can also be remotely restarted or shut down. The content that users can access or play using the app is stored in the device for faster access, and that content is synced (i.e. updated) periodically from a remote content syncing server. All of these are happening over the internet and the devices are equipped with a 3G chip, which makes it easier to download large amount of data with a decent network speed, else the content syncing would be a real pain. Below is the list of rough requirements that we had:

* The main app will be the only app which users can access.
* Automatic update over the air using a provisioning server.
* Sync content from a remote content syncing server.
* Report Crashes and device health statuses to the server.

<!--more-->
If you look at the requirements above, this ain't an easy task and sure it's not, we're developing the app since last few months and are close to completion, the app is currently being field tested and hopefully it'll soon be live out there in the wild.

So the big question is what are the challenges that we faced while we pulled off this effort, the purpose of this blog post is to share some of the findings/knowledge that we've gained over the period of time while developing the app. The ways that we've adopted are not the ones which can be adopted if you're going to have your app be distributed through the Android market, our app isn't or will not be distributed from the Android market, this is a custom application developed for a very specific/limited set of devices in mind. I'll cover each of the requirements mentioned above and will share some of the rough design choices that we made in order to meet the requirements.


## The main app will be the only app which users can access
There's only one way that you can have this kind of application in Android, make your app a homescreen app, so that whenever users press home/back button they'll land up right there in your app, and they can't get out of it (provided your app is the default one). In order to prevent users from exiting your app, you may need to handle some other stuff like options menu, disable recent items, and may be some extra buttons (some Chinese devices come with extra buttons on 7&Prime; Android tablets) etc. These extra keys can be handled/prevented using Android key handling code.

## Automatic update over the air using a provisioning server
This is an interesting part, you may be aware of that in Android the automatic update of an app can only happen through Marketplace, there's no other way to update an app. But our app is not going to be distributed through Marketplace, so how do we update then? Well there's no easy way to do it, and the process is complicated.

First of all, in Android in order to _silently install_ an app, you need special permission called INSTALL_PACKAGES which is a _system permission_ and IS NOT available to apps _not signed_ with system/firmware certificate. This is an issue that we need to get past in order to make it happen, after few days of searching and testing several options, I narrowed it down to the following options:

1. **Sign the app with the system certificate** - This was not possible because we couldn't procure the certificate from the hardware vendor of our choice.
2. **Install our own Android custom ROM with the app bundled** - This was possible, but it requires more engineering effort as well as taking care of device drivers that manufacturers ship with the device. Other than that there's a maintenance effort involved in future where we have to ensure that our custom Android ROM works with at least two to three different devices. So, this too was not a viable solution for us.
3. **Root the device and install the package through code** - This was the last option that I tried and IT WORKED!, after couple of iterations on rooting procedure, I managed to root the device properly. 

At first I tried the **rageagainstthecage** exploit to root, but it were only able to temporarily root the device and it wouldn't survive a reboot. Then I used **psneuter** to root the device and installed **busybox** and the modified **su** binary provided by the excellent guys from [**SuperOneClick**](http://shortfuse.org/) installer. Along with that I also installed the [Superuser](https://market.android.com/details?id=com.noshufou.android.su&hl=en) app to manage the *su* permissions. Once the rooting procedure is in place it's time to move on to code and write an Android service which can automatically install our application.

### Updater Service

This service is the crux of this application, it acts as a "remote control" to manage the device as well as our homescreen application. We decided to build it as a separate app not part of the homescreen application, because this app is not going to have any GUI. So how does this work? Below is the rough diagram of it's architecture:

![Updater Service Sequence Diagram](/images/updater-service-sequence-diagram.png)

In the above diagram, our Updater app is started whenever the device is rebooted (as per our installation process, we reboot the device after installing the update service app), it sets up a repeating alarm using a *PendingIntent*, which is invoked after a certain period of time, in the mean time it also makes a quick request to the provisioning server for any available update. If there's an update then the UpdateService downloads the APK (link provided in the update check response) and once it's downloaded (stored in the SDcard) it then fires up an intent to start the PackageInstaller and gives the APK file path as part of the intent payload. The PackageInstaller then runs the ```pm install -r <apkPath>``` command with ```su``` privilege. In order to execute the commands as *root* I used a modified version of the [excellent piece of code available from here](http://muzikant-android.blogspot.com/2011/02/how-to-get-root-access-and-execute.html). Once the installation process is complete we notify the backend server that the device has been updated with the latest app (by the way it may already be clear to you that the provisioning server has the list of devices running in the wild and knows which device is running what version of the app). Anyway, this cycle of checking for updates continues as every time the alarm fires or the device is rebooted.


Although the entire procedure went smoothly, it wasn't without a hitch, as I mentioned that our app is a homescreen application and in Android when you have multiple homescreen apps, every time you click on the home button you're presented with a list of homescreen apps to choose from. So in our case we have two homescreen apps one is the default Android **Launcher** and the other is our homescreen app, as part of the installation procedure we set that app up to be the default one. But after update that settings was getting reset and pressing on the home button again was displaying that list of homescreen apps to choose from. We tried to solve this through code by setting our own ```Activity``` as the default homescreen app using the Android API ```addPreferredActivty()``` but that didn't work because it has been removed/disabled by Google from Android 2.2 Froyo onwards (it was available till 2.1), the device that we're using has the Android version 2.2.2. This was almost a dead end and that time we came up with a **very interesting** hack, and the trick is very simple **just rename the launcher APK**, ya that's it just rename it and it's gone :-). So here's the steps that we have:


#### Before Install Steps
1. Mount the ```/system``` folder as RW volume using ```busybox```, by default it's readonly.
2. Restore(rename) the original lancher apk back to "Launcher.apk"
3. Unmount the ```/system``` back to it's original ReadOnly mode.


Example commands:
{% codeblock Example commands lang:bash %}
$ busybox mount -o rw,remount /system
$ mv /system/app/Launcher.tmp.apk /system/app/Launcher.apk
$ busybox mount -o ro,remount /system
{% endcodeblock %}

#### After Install Steps
1. Mount the ```/system``` folder as RW volume using ```busybox```, by default it's readonly.
2. Rename the original "Launcher.apk" to "Launcher.tmp.apk"
3. Unmount the ```/system``` back to it's original ReadOnly mode.

Example commands:
{% codeblock Example commands lang:bash %}
$ busybox mount -o rw,remount /system
$ mv /system/app/Launcher.apk /system/app/Launcher.tmp.apk
$ busybox mount -o ro,remount /system
{% endcodeblock %}

Note: In some devices the Launcher apk may be named as Launcher2.apk.


## Sync content from a remote content syncing server

Similarly to the update service above, the Content Syncing part is also a separate app without a GUI, it gets started on RECEIVE_BOOT_COMPLETED intent and checks for updated content once a day. We download a pretty large amount of data which can range anywhere from 100MB-1GB. Below is the sequence diagram of the rough architecture that we have:

![Content Sync Sequence Diagram](/images/content-sync-sequence-diagram.png)

Once the download sync is complete, the app sends an Intent notifying the Main homescreen application about the content update so that it can display a friendly message to the user in case the device content is being used/played at that time. The main app stores some of the data in memory or in a SQLite database when it starts, so in order to cleanly rebuild that entire data structure we're currently rebooting the device. But in future *we're planning to avoid it, so that the content update does not need a reboot*.


## Conclusion

This project has helped us gain a lot of valuable knowledge and insight into the Android platform and development practices as a whole. It has been a tremendous learning exercise for all of us. Even though the project is nearing completion, there are still some cases where we can optimize a bit, for example if you have gone through the above diagrams then you may have realized that the flows can be simplified even further by introducing **Android Push Messaging (C2DM)**, this we'll do sometime in later months, and as we already have the provisioning server in place then it's just a matter of time that we develop the feaures and push it to the wild.

On a closing note, if you want to build an app like this, then you can get in touch with me at <arnabc@webgyani.com>, I'd be happy to help you.

Thanks for reading!


---
Note: I have developed a generic Kiosk Management Solution called [MobiLock Pro](https://mobilock.in) which has the above functionality as well as many other features. If you want to have a fully managed Cloud Based Kiosk solution then do check out **MobiLock Pro**.
---
