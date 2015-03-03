EASYSAX - pure javascript sax-style parser for xml
==================================================
Простой и быстрый SAX парсер XML файлов.
Реализован по принципу парсить только то что нужно и как можно быстрее.
Парсер не потоковый, и не расчитан на гиганские файлы. Весь XML должен быть в памяти.
Встроенный уникальный механизм работы с пространсвами имен.


Парсер был написан для RSS ридера http://zzreader.com
На конец 2012 года остается самым быстрым SAX парсером под NODE.JS



BENCHMARK
---------------------------------------------------

**benchmark/test.js, parse file #1**
```
sax-js: 12671ms
libxmljs: 11311ms
expat: 6118ms
expat buffer: 5278ms
easysax : 1739ms  //  namespace--on, attr()--on , entity_decode--on
easysax: 1035ms   //  namespace--off, attr()--on , entity_decode--on
easysax: 740ms    //  namespace--off, attr()--off , entity_decode--off
```


**benchmark/test.js, parse file #2 (много атрибутов)**
```
sax-js: 84060ms
libxmljs: 48919ms
expat: 39444ms
expat buffer: 35375ms
easysax: 14655ms  //  namespace--on, attr()--on , entity_decode--on
easysax: 9874ms   //  namespace--off, attr()--on , entity_decode--on
easysax: 3531ms   //  namespace--off, attr()--off , entity_decode--on
easysax: 2954ms   //  namespace--off, attr()--off , entity_decode--off
```


**demo/example.js, parse file #2**
```
1,000 pages for: 13335ms -  attr()--all
1,000 pages for: 7300ms  -  attr()--on_request
```
