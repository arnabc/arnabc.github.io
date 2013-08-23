---
layout: post
title: "Asynchronous HTTP requests in Android using Volley"
date: 2013-08-21 22:24
comments: true
categories: Android Volley
---

Volley is the new Swiss Army Knife of Android Developers, it provides some nice utilities which makes the networking for Android apps easier and faster. The good thing about Volley is that it abstracts away the low level details of what HTTP client library is being used under the hood and helps you focus on writing nice and clean RESTful HTTP requests. Additionally all requests in Volley are executed asynchronously on a different thread without blocking your "main thread".
<!-- more -->

## What are the features that Volley provides?

Important features of the Volley library:

* A high level API to make asynchronous RESTful HTTP requests
* An elegant and robust Request queue
* An extensible architecture which allows developers to implement custom request and response handling mechanism
* Ability to use external HTTP client library
* Robust request caching policy
* Custom views to load and cache images from Network (```NetworkImageView```, ```ImageLoader``` etc)


## Why use asynchronous HTTP requests?

In Android it is always a good practice to make HTTP requests asynchronously, in fact from HoneyComb onwards it is no longer just a "good practice", you must make HTTP requests asynchronously off the main thread or else you'll get this nasty exception ```android.os.NetworkOnMainThreadException```. Blocking the main thread has some serious consequences, it hampers UI rendering, harmful to smooth user experience and above all it can cause dreaded ANR (Application Not Responding). To avoid all these pitfalls you as a developer should always ensure that your HTTP requests are on a different thread.


## How to use Volley

We are going to cover the following items in this blog post, by the end of it you should be able to have a clear understanding of Volley and how to use it in your application.

* Installing and using Volley as a library project
* Using Request Queue
* Making asynchronous JSON and String HTTP requests
* Cancelling requests
* Retrying failed requests, customizing request Timeout
* Setting Request Headers (HTTP headers)
* Using cookies
* Error Handling


### Installing and using Volley as a library project

Volley is part of AOSP and right now it is not being distributed as a JAR, the easiest way to include Volley to your project is to clone the Volley repository and set it as a library project.

#### Using as a library project

Git clone the repository using the following command and then import it as Android library project:

{% codeblock lang:sh %}
$ git clone https://android.googlesource.com/platform/frameworks/volley
{% endcodeblock %}


#### Using as a JAR

Clone the repository as shown above and then run the following commands to export it as JAR and after that add the JAR file to your project's ```/libs``` folder:

{% codeblock lang:bash %}
# in Volley project root (ensure the `android` executable is in your path)
$ android update project -p .
# the following command will create a JAR file and put it in ./bin
$ ant jar
{% endcodeblock %}

  
### Using Request Queue

All requests in Volley are placed in a queue first and then processed, here is how you will be creating a request queue:

{% codeblock RequestQueue lang:java %}
RequestQueue mRequestQueue = Volley.newRequestQueue(this); // 'this' is Context
{% endcodeblock %}

Ideally you should have one centralized place for your Queue, and the best place to initialize queue is in your [Application](http://developer.android.com/reference/android/app/Application.html) class. Here is how this can be done:

{% codeblock ApplicationController.java lang:java %}

public class ApplicationController extends Application {

    /**
     * Log or request TAG
     */
    public static final String TAG = "VolleyPatterns";

    /**
     * Global request queue for Volley
     */
    private RequestQueue mRequestQueue;

    /**
     * A singleton instance of the application class for easy access in other places
     */
    private static ApplicationController sInstance;

    @Override
    public void onCreate() {
        super.onCreate();
        
        // initialize the singleton
        sInstance = this;
    }

    /**
     * @return ApplicationController singleton instance
     */
    public static synchronized ApplicationController getInstance() {
        return sInstance;
    }

    /**
     * @return The Volley Request queue, the queue will be created if it is null
     */
    public RequestQueue getRequestQueue() {
        // lazy initialize the request queue, the queue instance will be
        // created when it is accessed for the first time
        if (mRequestQueue == null) {
            mRequestQueue = Volley.newRequestQueue(getApplicationContext());
        }

        return mRequestQueue;
    }    
 
    /**
     * Adds the specified request to the global queue, if tag is specified
     * then it is used else Default TAG is used.
     * 
     * @param req
     * @param tag
     */
    public <T> void addToRequestQueue(Request<T> req, String tag) {
        // set the default tag if tag is empty
        req.setTag(TextUtils.isEmpty(tag) ? TAG : tag);
        
        VolleyLog.d("Adding request to queue: %s", req.getUrl());
        
        getRequestQueue().add(req);
    }
 
    /**
     * Adds the specified request to the global queue using the Default TAG.
     * 
     * @param req
     * @param tag
     */
    public <T> void addToRequestQueue(Request<T> req) {
        // set the default tag if tag is empty
        req.setTag(TAG);
        
        getRequestQueue().add(req);
    }
 
    /**
     * Cancels all pending requests by the specified TAG, it is important
     * to specify a TAG so that the pending/ongoing requests can be cancelled.
     * 
     * @param tag
     */
    public void cancelPendingRequests(Object tag) {
        if (mRequestQueue != null) {
            mRequestQueue.cancelAll(tag);
        }
    }
}

{% endcodeblock %}


### Making asynchronous HTTP requests

Volley provides the following utility classes which you can use to make asynchronous HTTP requests:

* [JsonObjectRequest](http://goo.gl/CRMvRj) -- To send and receive JSON Object from the Server
* [JsonArrayRequest](http://goo.gl/F02Ew3) -- To receive JSON Array from the Server
* [StringRequest](http://goo.gl/c5DB8p) -- To retrieve response body as String (ideally if you intend to parse the response by yourself)


_Note:_ To send parameters in request body you need to override either ```getParams()``` or ```getBody()``` method of the request classes (as required) described below.


#### JsonObjectRequest

This class can be used to send and receive JSON object. An overloaded constructor of this class allows to set appropriate request method (DELETE, GET, POST and PUT). This is the class which you should be using frequently if you are working with a RESTful backend. The following examples show how to make GET and POST requests.
 

Using HTTP GET method:

{% codeblock JsonObjectRequest lang:java %}
final String URL = "/volley/resource/12";
// pass second argument as "null" for GET requests
JsonObjectRequest req = new JsonObjectRequest(URL, null,
	     new Response.Listener<JSONObject>() {
	         @Override
	         public void onResponse(JSONObject response) {
	             try {
	                 VolleyLog.v("Response:%n %s", response.toString(4));
	             } catch (JSONException e) {
	                 e.printStackTrace();
	             }
	         }
	     }, new Response.ErrorListener() {
	         @Override
	         public void onErrorResponse(VolleyError error) {
	             VolleyLog.e("Error: ", error.getMessage());
	         }
	     });

// add the request object to the queue to be executed
ApplicationController.getInstance().addToRequestQueue(req);
{% endcodeblock %}

Using HTTP POST method:

{% codeblock JsonObjectRequest lang:java %}
final String URL = "/volley/resource/12";
// Post params to be sent to the server
HashMap<String, String> params = new HashMap<String, String>();
params.put("token", "AbCdEfGh123456");

JsonObjectRequest req = new JsonObjectRequest(URL, new JSONObject(params),
	     new Response.Listener<JSONObject>() {
	         @Override
	         public void onResponse(JSONObject response) {
	             try {
	                 VolleyLog.v("Response:%n %s", response.toString(4));
	             } catch (JSONException e) {
	                 e.printStackTrace();
	             }
	         }
	     }, new Response.ErrorListener() {
	         @Override
	         public void onErrorResponse(VolleyError error) {
	             VolleyLog.e("Error: ", error.getMessage());
	         }
	     });

// add the request object to the queue to be executed
ApplicationController.getInstance().addToRequestQueue(req);
{% endcodeblock %}


#### JsonArrayRequest

This class can be used to retrieve **JSON array** but not **JSON object** and only HTTP GET is supported as of now. As it supports only GET, so if you are to specify some querystring parameters then append those in the URL itself. The constructor does not accept request parameters.

{% codeblock JsonArrayRequest lang:java %}
final String URL = "/volley/resource/all?count=20";
JsonArrayRequest req = new JsonArrayRequest(URL, new Response.Listener<JSONArray> () {
    @Override
    public void onResponse(JSONArray response) {
        try {
            VolleyLog.v("Response:%n %s", response.toString(4));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
}, new Response.ErrorListener() {
    @Override
    public void onErrorResponse(VolleyError error) {
        VolleyLog.e("Error: ", error.getMessage());
    }
});

// add the request object to the queue to be executed
ApplicationController.getInstance().addToRequestQueue(req);
{% endcodeblock %}


#### StringRequest

This class can be used to retrieve the response from server as String, ideally you should use this class when you intend to parse the response by yourself, e.g. if it is XML. It also provides overloaded constructors to further customize your request.

{% codeblock StringRequest lang:java %}
final String URL = "/volley/resource/recent.xml";
StringRequest req = new StringRequest(URL, new Response.Listener<String>() {
    @Override
    public void onResponse(String response) {
        VolleyLog.v("Response:%n %s", response);
    }
}, new Response.ErrorListener() {
    @Override
    public void onErrorResponse(VolleyError error) {
        VolleyLog.e("Error: ", error.getMessage());
    }
});

// add the request object to the queue to be executed
ApplicationController.getInstance().addToRequestQueue(req);
{% endcodeblock %}

Setting a priority to the request is possible, this may be desirable in some cases where you want to move certain requests higher up in the order. The requests are processed from higher priorities to lower priorities, in FIFO order. To set a priority you need to override the ```getPriority()``` method of the request class. The current available priorities are - ```Priority.LOW```, ```Priority.NORMAL```, ```Priority.HIGH``` and ```Priority.IMMEDIATE```.

### Cancelling requests

Volley provides powerful APIs to cancel pending or ongoing requests, one reason when you need to do this is if user rotates his device while a request is ongoing you need to cancel that because the Activity is going be restarted. The easiest way to cancel a request is to call the ```cancelAll(tag)``` method of the request queue, this will only work if you have set a **tag on the request object** before adding it to the queue. The ability to tag requests allows you to cancel all pending requests for that tag in one method call.

Adding a request to the queue using a tag:

{% codeblock lang:java %}
request.setTag("My Tag");
{% endcodeblock %}

As per the ApplicationController class shown above, this is how you'll add the request to the queue:

{% codeblock lang:java %}
ApplicationController.getInstance().addToRequestQueue(request, "My Tag");
{% endcodeblock %}

Cancelling all requests with the specified tag:

{% codeblock lang:java %}
mRequestQueue.cancelAll("My Tag");
{% endcodeblock %}

As per the ApplicationController class shown above, this is how you'll cancel the requests:

{% codeblock lang:java %}
ApplicationController.getInstance().addToRequestQueue(request, "My Tag");
{% endcodeblock %}


### Retrying failed requests and customizing request Timeout

There is no direct way to specify request timeout value in Volley, but there is a workaround, you need to set a RetryPolicy on the request object. The ```DefaultRetryPolicy``` class takes an argument called _initialTimeout_, this can be used to specify a request timeout, make sure the maximum retry count is 1 so that volley does not retry the request after the timeout has been exceeded.

{% codeblock Setting Request Timeout lang:java %}
request.setRetryPolicy(new DefaultRetryPolicy(20 * 1000, 1, 1.0f));
{% endcodeblock %}

If you want to retry failed requests (due to timeout) you can specify that too using the code above, just increase the retry count. Note the last argument, it allows you to specify a backoff multiplier which can be used to implement "exponential backoff" that some RESTful services recommends.


### Setting Request Headers (HTTP headers)

Sometimes it is necessary to add extra headers to the HTTP requests, one common case is to add an "Authorization" header for HTTP Basic Auth. Volley Request class provides a method called ```getHeaders()``` which you need to override to add your custom headers if necessary. 

Adding custom headers:

{% codeblock lang:java %}
JsonObjectRequest req = new JsonObjectRequest(URL, new JSONObject(params),
           new Response.Listener<JSONObject>() {
               @Override
               public void onResponse(JSONObject response) {
                   // handle response
               }
           }, new Response.ErrorListener() {
               @Override
               public void onErrorResponse(VolleyError error) {
                   // handle error                        
               }
           }) {
       
       @Override
       public Map<String, String> getHeaders() throws AuthFailureError {
           HashMap<String, String> headers = new HashMap<String, String>();
           headers.put("CUSTOM_HEADER", "Yahoo");
           headers.put("ANOTHER_CUSTOM_HEADER", "Google");
           return headers;
       }
   };
{% endcodeblock %}


### Using cookies

There is no direct API through which you can set cookies in Volley. This makes sense because the core philosophy of Volley is to provide clean APIs to write RESTful HTTP requests, these days most of the  RESTful API providers prefer authentication tokens instead of cookies. Using cookies in Volley is a bit more involed process and not very straight forward. 

Here is a modified version of the ```getRequestQueue()``` method of our ApplicationController class shown above, also contains the rough code required to set a cookie:

{% codeblock lang:java %}
// http client instance
private DefaultHttpClient mHttpClient;
public RequestQueue getRequestQueue() {
    // lazy initialize the request queue, the queue instance will be
    // created when it is accessed for the first time
    if (mRequestQueue == null) {
        // Create an instance of the Http client. 
        // We need this in order to access the cookie store
        mHttpClient = new DefaultHttpClient();
        // create the request queue
        mRequestQueue = Volley.newRequestQueue(this, new HttpClientStack(mHttpClient));
    }
    return mRequestQueue;
}

/**
 * Method to set a cookie
 */
public void setCookie() {
    CookieStore cs = mHttpClient.getCookieStore();
    // create a cookie
    cs.addCookie(new BasicClientCookie2("cookie", "spooky"));
}


// add the cookie before adding the request to the queue
setCookie();

// add the request to the queue
mRequestQueue.add(request);

{% endcodeblock %}


### Error Handling

As you have seen in the above code examples when you create a request object in Volley you need to specify  an error listener, Volley invokes the ```onErrorResponse``` callback method of that listener passing an instance of the ```VolleyError``` object when there is an error while performing the request.

The following is the list of exceptions in Volley:

* **AuthFailureError** -- If you are trying to do Http Basic authentication then this error is most likely to come.
* **NetworkError** -- Socket disconnection, server down, DNS issues might result in this error.
* **NoConnectionError** -- Similar to NetworkError, but fires when device does not have internet connection, your error handling logic can club ```NetworkError``` and ```NoConnectionError``` together and treat them similarly.
* **ParseError** -- While using ```JsonObjectRequest``` or ```JsonArrayRequest``` if the received JSON is malformed then this exception will be generated. If you get this error then it is a problem that should be fixed instead of being handled.
* **ServerError** -- The server responded with an error, most likely with _4xx_ or _5xx_ HTTP status codes.
* **TimeoutError** -- Socket timeout, either server is too busy to handle the request or there is some network latency issue. By default Volley times out the request after **2.5 seconds**, use a RetryPolicy if you are consistently getting this error.


You can use a simple helper like the following to display appropriate message when one of these exceptions occurs:

{% codeblock VolleyErrorHelper.java lang:java %}
public class VolleyErrorHelper {
     /**
     * Returns appropriate message which is to be displayed to the user 
     * against the specified error object.
     * 
     * @param error
     * @param context
     * @return
     */
	public static String getMessage(Object error, Context context) {
		if (error instanceof TimeoutError) {
			return context.getResources().getString(R.string.generic_server_down);
		} 
		else if (isServerProblem(error)) {
			return handleServerError(error, context);
		}
		else if (isNetworkProblem(error)) {
			return context.getResources().getString(R.string.no_internet);
		} 
		return context.getResources().getString(R.string.generic_error);
	}
	
	/**
	 * Determines whether the error is related to network
	 * @param error
	 * @return
	 */
	private static boolean isNetworkProblem(Object error) {
	    return (error instanceof NoConnectionError) || (error instanceof NoConnectionError);
	}
	/**
	 * Determines whether the error is related to server
	 * @param error
	 * @return
	 */
	private static boolean isServerProblem(Object error) {
	    return (error instanceof ServerError) || (error instanceof AuthFailureError);
	}
	/**
	 * Handles the server error, tries to determine whether to show a stock message or to 
	 * show a message retrieved from the server.
	 * 
	 * @param err
	 * @param context
	 * @return
	 */
	private static String handleServerError(Object err, Context context) {
	    VolleyError error = (VolleyError) err;
	    
	    NetworkResponse response = error.networkResponse;
	    
	    if (response != null) {
	        switch (response.statusCode) {
            case 404:
            case 422:
            case 401:
                try {
                	  // server might return error like this { "error": "Some error occured" }
                	  // Use "Gson" to parse the result
                    HashMap<String, String> result = new Gson().fromJson(new String(response.data),
                            new TypeToken<Map<String, String>>() {
                            }.getType());
                    
                    if (result != null && result.containsKey("error")) {
                        return result.get("error");
                    }
                    
                } catch (Exception e) {
                    e.printStackTrace();
                }
                // invalid request
                return error.getMessage();

            default:
                return context.getResources().getString(R.string.generic_server_down);
            }
	    }
        return context.getResources().getString(R.string.generic_error);
	}
}
{% endcodeblock %}


## Conclusion
Volley is really a nice library and you should seriously consider giving this a try. It will help you simplify your network requests and also add a ton of additional benefits. 

I understand that it's a tl;dr post, actually I tried to be as comprehensive as possible, I am planning to come up with another post about image loading using Volley and some gotchas that I noticed while using the library in one of my projects, till then stay tuned.


Thanks for reading, I hope you enjoyed this :-)


## References

* NetworkOnMainThreadException -- http://developer.android.com/reference/android/os/NetworkOnMainThreadException.html
* Application -- http://developer.android.com/reference/android/app/Application.html