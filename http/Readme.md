Sample code:
```js
    var http = require("http");
    
    // Universal request method. You can use HttpRequestOptions to set varios properties like url, headers, etc., 
    // HttpResponse to get status code, headers and content and HttpContent to get body of response:

    interface HttpRequestOptions {
        url: string;
        method: string;
        headers?: any;
        content?: HttpContent;
    }

    interface HttpResponse {
        statusCode: number;
        headers: any;
        content?: HttpContent;
    }

    interface HttpContent {
        toString: () => string;
        toJSON: () => any;
        toImage: () => image_module.Image;
    }
```

More info: https://github.com/telerik/xPlatCore/blob/master/Documentation/Snippets/http.md