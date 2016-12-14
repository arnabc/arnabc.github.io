---
layout: post
title: "How to write custom launcher app in Android"
date: 2013-08-16 14:54
author: Arnab Chakraborty
comments: true
github_widget: true
categories: [Android, homescreen, Homescreen Apps, launcher]
---

In Android the screen that appears when the phone starts is called "Launcher Screen". It is possible in Android to write custom launcher apps which can be used as a replacement for the default launcher app that comes bundled with the phone. Developing a launcher app is no different than developing any other Android application, in fact both are same. In this post I'll share what you need to do to write your own custom launcher application.
<!-- more -->


##AndroidManifest.xml
I'll skip the part of creating the project and drive straight to the code. Here is our sample `AndroidManifest.xml` file, remember to pay attention to the comments in the code.

{% codeblock AndroidManifest.xml lang:xml %}

<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="ch.arnab.simplelauncher"
    android:versionCode="1"
    android:versionName="1.0" >

    <uses-sdk
        android:minSdkVersion="8"
        android:targetSdkVersion="16" />

    <application
        android:launchMode="singleTask"
        android:clearTaskOnLaunch="true"
        android:stateNotNeeded="true"
        android:icon="@drawable/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme" >
        <activity
            android:name="ch.arnab.simplelauncher.HomeScreen"
            android:label="@string/app_name"
            android:launchMode="singleTask"
            android:excludeFromRecents="true"
            android:screenOrientation="nosensor">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <!-- The following two intent-filters are the key to set homescreen -->
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />

            </intent-filter>
        </activity>
    </application>
</manifest>

{% endcodeblock %}


The important line in the above _XML_ file is `<category android:name="android.intent.category.HOME" />`, this `intent-filter` allows you to set your application as **Home Screen** application. Android looks for this particular intent filter and whenever you install your app with this intent-filter set then your application will appear in the list of installed launchers (a tap on the Home button will reveal the list).



##Display installed applications in our custom homescreen

Now as we have finished with the manifest file, let's add some code to display the list of installed applications in our Home Screen, this way we can at least use the app after installing.

### AsyncTaskLoader to asynchronously load applications
Here is the code to load the applications list asynchronously, we're using a custom AsyncTaskLoader class, later we'll hook it up in our fragment class using the Android Loaders.

{% codeblock AppsLoader.java lang:java %}
public class AppsLoader extends AsyncTaskLoader<ArrayList<AppModel>> {
    ArrayList<AppModel> mInstalledApps;

    final PackageManager mPm;

    public AppsLoader(Context context) {
        super(context);

        mPm = context.getPackageManager();
    }

    @Override
    public ArrayList<AppModel> loadInBackground() {
        // retrieve the list of installed applications
        List<ApplicationInfo> apps = mPm.getInstalledApplications(0);

        if (apps == null) {
            apps = new ArrayList<ApplicationInfo>();
        }

        final Context context = getContext();

        // create corresponding apps and load their labels
        ArrayList<AppModel> items = new ArrayList<AppModel>(apps.size());
        for (int i = 0; i < apps.size(); i++) {
            String pkg = apps.get(i).packageName;

            // only apps which are launchable
            if (context.getPackageManager().getLaunchIntentForPackage(pkg) != null) {
                AppModel app = new AppModel(context, apps.get(i));
                app.loadLabel(context);
                items.add(app);
            }
        }

        // sort the list
        Collections.sort(items, ALPHA_COMPARATOR);
        return items;
    }

    @Override
    public void deliverResult(ArrayList<AppModel> apps) {
        if (isReset()) {
            // An async query came in while the loader is stopped.  We
            // don't need the result.
            if (apps != null) {
                onReleaseResources(apps);
            }
        }

        ArrayList<AppModel> oldApps = apps;
        mInstalledApps = apps;

        if (isStarted()) {
            // If the Loader is currently started, we can immediately
            // deliver its results.
            super.deliverResult(apps);
        }

        // At this point we can release the resources associated with
        // 'oldApps' if needed; now that the new result is delivered we
        // know that it is no longer in use.
        if (oldApps != null) {
            onReleaseResources(oldApps);
        }
    }

    @Override
    protected void onStartLoading() {
        if (mInstalledApps != null) {
            // If we currently have a result available, deliver it
            // immediately.
            deliverResult(mInstalledApps);
        }

        if (takeContentChanged() || mInstalledApps == null ) {
            // If the data has changed since the last time it was loaded
            // or is not currently available, start a load.
            forceLoad();
        }
    }

    @Override
    protected void onStopLoading() {
        // Attempt to cancel the current load task if possible.
        cancelLoad();
    }

    @Override
    public void onCanceled(ArrayList<AppModel> apps) {
        super.onCanceled(apps);

        // At this point we can release the resources associated with 'apps'
        // if needed.
        onReleaseResources(apps);
    }

    @Override
    protected void onReset() {
        // Ensure the loader is stopped
        onStopLoading();

        // At this point we can release the resources associated with 'apps'
        // if needed.
        if (mInstalledApps != null) {
            onReleaseResources(mInstalledApps);
            mInstalledApps = null;
        }
    }

    /**
     * Helper method to do the cleanup work if needed, for example if we're
     * using Cursor, then we should be closing it here
     *
     * @param apps
     */
    protected void onReleaseResources(ArrayList<AppModel> apps) {
        // do nothing
    }

    /**
     * Perform alphabetical comparison of application entry objects.
     */
    public static final Comparator<AppModel> ALPHA_COMPARATOR = new Comparator<AppModel>() {
        private final Collator sCollator = Collator.getInstance();
        @Override
        public int compare(AppModel object1, AppModel object2) {
            return sCollator.compare(object1.getLabel(), object2.getLabel());
        }
    };
}
{% endcodeblock %}

The loader class above will only retrieve the applications for which a "good" launch intent is available, put simply we're only displaying those applications for which ```getLaunchIntentForPackage``` returns a valid launch intent.


### GridView Adapter

A simple adapter used to populate the applications' icons and names in a ```GridView```.

{% codeblock AppListAdapter.java lang:java %}
public class AppListAdapter extends ArrayAdapter<AppModel> {
    private final LayoutInflater mInflater;

    public AppListAdapter (Context context) {
        super(context, android.R.layout.simple_list_item_2);

        mInflater = LayoutInflater.from(context);
    }

    public void setData(ArrayList<AppModel> data) {
        clear();
        if (data != null) {
            addAll(data);
        }
    }

    @Override
    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    public void addAll(Collection<? extends AppModel> items) {
        //If the platform supports it, use addAll, otherwise add in loop
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
            super.addAll(items);
        }else{
            for(AppModel item: items){
                super.add(item);
            }
        }
    }

    /**
     * Populate new items in the list.
     */
    @Override public View getView(int position, View convertView, ViewGroup parent) {
        View view;

        if (convertView == null) {
            view = mInflater.inflate(R.layout.list_item_icon_text, parent, false);
        } else {
            view = convertView;
        }

        AppModel item = getItem(position);
        ((ImageView)view.findViewById(R.id.icon)).setImageDrawable(item.getIcon());
        ((TextView)view.findViewById(R.id.text)).setText(item.getLabel());

        return view;
    }
}
{% endcodeblock %}
  
&nbsp;
 

### Grid Fragment
Grid view container fragment class, uses Android Loaders to load the list of applications and displays them in the Grid view.

{% codeblock AppsGridFragment.java lang:java %}

public class AppsGridFragment extends GridFragment implements LoaderManager.LoaderCallbacks<ArrayList<AppModel>> {

    AppListAdapter mAdapter;

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);

        setEmptyText("No Applications");

        mAdapter = new AppListAdapter(getActivity());
        setGridAdapter(mAdapter);

        // till the data is loaded display a spinner
        setGridShown(false);

        // create the loader to load the apps list in background
        getLoaderManager().initLoader(0, null, this);
    }

    @Override
    public Loader<ArrayList<AppModel>> onCreateLoader(int id, Bundle bundle) {
        return new AppsLoader(getActivity());
    }

    @Override
    public void onLoadFinished(Loader<ArrayList<AppModel>> loader, ArrayList<AppModel> apps) {
        mAdapter.setData(apps);

        if (isResumed()) {
            setGridShown(true);
        } else {
            setGridShownNoAnimation(true);
        }
    }

    @Override
    public void onLoaderReset(Loader<ArrayList<AppModel>> loader) {
        mAdapter.setData(null);
    }

    @Override
    public void onGridItemClick(GridView g, View v, int position, long id) {
        AppModel app = (AppModel) getGridAdapter().getItem(position);
        if (app != null) {
            Intent intent = getActivity().getPackageManager().getLaunchIntentForPackage(app.getApplicationPackageName());

            if (intent != null) {
                startActivity(intent);
            }
        }
    }
}

{% endcodeblock %}

&nbsp;


### Layout file
A simple layout file to embed the grid fragment.

{% codeblock homescreen.xml lang:xml %}
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:paddingLeft="@dimen/activity_horizontal_margin"
    android:paddingRight="@dimen/activity_horizontal_margin"
    android:paddingTop="@dimen/activity_vertical_margin"
    android:paddingBottom="@dimen/activity_vertical_margin"
    tools:context=".HomeScreen">

    <fragment
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:name="ch.arnab.simplelauncher.AppsGridFragment"
            android:id="@+id/apps_grid" />

</RelativeLayout>
{% endcodeblock %}

&nbsp;

## Running the homescreen application

As it's a Launcher app, so when you install it you don't get to see anything unless you tap on the home button. The tap on the Home button  shows you a chooser dialog from which you can select the appropriate Launcher app.


That's it, you now have your own custom launcher application. Although a full-fledged launcher app like the ones that come with Android phones has many features built into them, but you can use this as a basic building block and start writing a more advanced and complex launcher as you learn.

For those who wants to investigate further, do take a look at the default launcher application code here: [Android Stock Launcher App](https://android.googlesource.com/platform/packages/apps/Launcher2/+/master/)


**Update**: I wrote another post which provides a high-level overview of what all things are required to develop a "**kiosk-mode**" Android application. You can check it out here - [Developing kiosk-mode applications in Android](/blog/2013/11/developing-kiosk-mode-applications-in-android/)


You can download the full source code used in this article from this Github [repository](https://github.com/arnabc/simplelauncher/zipball/master).

<div class="github-widget" data-repo="arnabc/simplelauncher"></div>

---
Note: I have developed a generic Kiosk Management Solution called [MobiLock Pro](https://mobilock.in) which has the above functionality as well as many other features. If you want to have a fully managed Cloud Based Kiosk solution then do check out **MobiLock Pro**.
---
