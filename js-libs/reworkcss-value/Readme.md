
# css-value

  WIP CSS value parser

## Example

The CSS value string "1px 0 0 5% .5px .10 1.5" yields:

```js
[
  { type: 'number', string: '1px', unit: 'px', value: 1 },
  { type: 'number', string: '0', unit: '', value: 0 },
  { type: 'number', string: '0', unit: '', value: 0 },
  { type: 'number', string: '5%', unit: '%', value: 5 },
  { type: 'number', string: '.5px', unit: 'px', value: .5 },
  { type: 'number', string: '.10', unit: '', value: .1 },
  { type: 'number', string: '1.5', unit: '', value: 1.5 }
]
```

## License

(The MIT License)

Copyright (c) 2013 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
