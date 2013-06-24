---
layout: post
title: "Android - How to send gzipped JSON in HTTP request"
date: 2012-09-30 18:41
comments: false
categories: Android gzip
---

If you have ever developed an Android application which sends and consumes large amount of JSON data without gzipping then this post is probably for you. This is a very simple optimization technique that you can implement which vastly reduces the network latency and also benefits the users as well as internet. The idea is to transfer less data over the network and once you do that, it improves the speed of your application and helps users by reducing their mobile data usage (i.e saves $$$ in fact).
<!-- more -->

The [`AndroidHttpClient`][1] module offers a way to achieve this, when you're sending JSON requests you can gzip the content of the request params and add some necessary HTTP headers, which will provide a hint to your server that it has to decode the content before it is usable. Needless to say that this technique is not just limited to sending JSON, you can of course use it if you're sending CSV or text file over the network to server.

I'll show a way how this can be done using a Rails backend (that's what I use), but I presume this should not be too difficult to implement in case you're not using Rails. I'll be using JSON as an example here:


To encode or decode the JSON content you can use the following utility module in Android:

``` java util.java
public class Util {

    /**
     * Converts an InputStream to String
     * 
     * @param is
     * @return
     * @throws IOException
     */
    public static String streamToString(InputStream content) throws IOException {
        byte[] buffer = new byte[1024];
        int numRead = 0;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        while ((numRead = content.read(buffer)) != -1) {
            baos.write(buffer, 0, numRead);
        }

        content.close();

        return new String(baos.toByteArray());
    }

    /**
     * Compresses the content of the request parameters (as a string). Sets
     * appropriate HTTP headers also so that the server can decode it properly.
     * 
     * @param context Context
     * @param content The string request params, ideally JSON string
     * @param postReq The HttpPost request object
     * 
     */
    public static void setCompressedEntity(Context context, String content, HttpPost postReq) {
        try {
            byte[] data = content.getBytes("UTF-8");

            // if the length of the data exceeds the minimum gzip size then only
            // gzip it else it's not required at all
            if (content.length() > AndroidHttpClient
            		.getMinGzipSize(context.getContentResolver())) {
                // set necessary headers
                postReq.setHeader("Content-Encoding", "gzip");
            }

            // Compressed entity itself checks for minimum gzip size
            // and if the content is shorter than that size then it
            // just returns a ByteArrayEntity
            postReq.setEntity(AndroidHttpClient.getCompressedEntity(data, context.getContentResolver()));

        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Extracts the response content. If the server response is compressed, then
     * it transparently decompresses the content. In order to indicate to server
     * that you can consume JSON response, use the following code to add the "Accept"
     * header:
     *
     * AndroidHttpClient.modifyRequestToAcceptGzipResponse(HttpRequest request)
     * 
     * @param response
     *					HttpResponse Object
     * @return String content of the HttpResponse
     */
    public static String getIfCompressed(HttpResponse response) {
        if (response == null)
            return null;

        try {
            InputStream is = AndroidHttpClient.getUngzippedContent(response.getEntity());
            return streamToString(is);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }
}

```

The HTTP header, which indicates to server that the request content is gzipped, is `Content-Encoding: gzip`. On the Rails side you can use the following **Rack** middleware to decode JSON requests (you can set your webserver for example nginx to do the encoding on JSON responses):

A Rack middleware to decode the gzipped JSON, thanks to this [gist][2] by [relistan][3]:

``` ruby compressed_requests.rb
class CompressedRequests
  def initialize(app)
    @app = app
  end

  def method_handled?(env)
    !!(env['REQUEST_METHOD'] =~ /(POST|PUT)/)
  end

  def encoding_handled?(env)
    ['gzip', 'deflate'].include? env['HTTP_CONTENT_ENCODING']
  end

  def call(env)
    if method_handled?(env) && encoding_handled?(env)
      extracted = decode(env['rack.input'], env['HTTP_CONTENT_ENCODING'])

      env.delete('HTTP_CONTENT_ENCODING')
      env['CONTENT_LENGTH'] = extracted.length
      env['rack.input'] = StringIO.new(extracted)
    end

    status, headers, response = @app.call(env)
    return [status, headers, response]
  end
  
  def decode(input, content_encoding)
    case content_encoding
      when 'gzip' then Zlib::GzipReader.new(input).read
      when 'deflate' then Zlib::Inflate.inflate(input.read)
    end
  end
end
```

Now put this in somewhere in your Rails web application directory for example `lib/middleware`, just make sure that the file is loaded when Rails boots. To include the file in Rails' __autoload__ path, add it like this:

``` ruby application.rb
config.autoload_paths += %W(#{config.root}/lib #{config.root}/lib/middleware)
```

Once that is done, then you need to add this tiny little Rack app as a middleware, and the important trick is to add it before the `ActionDispatch::ParamsParser` middleware in Rails 3:

``` ruby application.rb
# Handle Compressed Requests, this middleware makes gzip content 
# handling transparent to the Rails stack
config.middleware.insert_before ActionDispatch::ParamsParser, "CompressedRequests"
```

That's all you need both on client and server to send and receive Gzipped content. If you're sending JSON from client and you wan't rails to interpret it as JSON, then don't forget to add `Content-Type: application/json` on your HTTP Request header.


Happy coding! If you have anything to say feel free to contact me on Twitter [@arnabc][4]


[1]: http://developer.android.com/reference/android/net/http/AndroidHttpClient.html
[2]: https://gist.github.com/2109707
[3]: https://gist.github.com/relistan
[4]: http://twitter.com/arnabc