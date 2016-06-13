describe('test for query', function() {	it('test1', function() {		var key = parser("ali/me={yes=if&yes=else&no={a={b=1}&a={z=4}}}/ali/you");		expect(key).toEqual(			{				ali : [					{						me : {							yes : [								'if', 'else'							],							no : {								a : [									{ b : '1' },									{										z : '4'									}								]							}						}					},					'you'				]			}		)  	});	it('test2', function() {		var key = parser("ali/me={yes=if&yes=else}");		expect(key).toEqual(			{				ali : {					me : {						yes : [							'if', 'else'						]					}				}			}		)  	});	it('test3', function() {		var key = parser("ali/yes/apz/no/i/{j=2&k=3}/nice/2/nice/3/nice/4");		expect(key).toEqual(			{				ali : 'yes',				apz : 'no',				i : {					j : '2',					k : '3'				},				nice : ['2', '3', '4']			}		)  	});	it('test4', function() {		var key = parser("ali/yes/ali/why=ooohhh/what/oh=false/i/{j=2&k=3}/nice/{x=1&x=2&x={x=4&x={x=6&x=7}}}");		expect(key).toEqual(			{				ali : [					'yes',					{						why : 'ooohhh'					}				],				what : {					oh : 'false'				},				i : {					j : '2', k : '3'				},				nice : {					x : [						'1', '2',						{							x : [								'4',								{									x : [										'6', '7'									]								}							]						}					]				}			}		)  	});	it('test5', function() {		var key = parser("x/x=1&x=2&x=3/y/x={x=10}");		expect(key).toEqual(			{				x : {					 x : [						 '1', '2', '3'					]				},				y : {					x :						{							x : '10'						}				}			}		)  	});	it('test6', function() {		var key = parser("category/visible=yes&selected={item=CategoryKey&level=int&visible=yes}&selected={item=CategoryKey&level=int&visible=yes}&selected={items=CategoryKey1&items=CategoryKey2&level=int&visible=yes}/apz/yes/me/i=1");		expect(key).toEqual(			{				category : {					visible : 'yes',					selected : [						{							item : 'CategoryKey', level : 'int', visible : 'yes'						},						{							item : 'CategoryKey', level : 'int', visible : 'yes'						},						{							items : ['CategoryKey1', 'CategoryKey2'], level : 'int', visible : 'yes'						}					]				},				apz : 'yes',				me : {					i : '1'				}			}		)  	});	it('test7', function() {		var key = parser("category/_name=saeed");		expect(key).toEqual(			{				category : {					name : ['saeed']				}			}		)  	});});function parser(query) {    var key = {};    var iq = query.split('/');    for (var n=0;n < iq.length; n+=2) {    		if(iq[n+1].slice(0,1)!= '{' && iq[n+1].indexOf('=') > -1) {        	iq [n+1] ='{' +iq[n+1]+'}';        }        if (key[iq[n]]) {          if (!Array.isArray(key[iq[n]])) {            key [iq[n]] =[key[iq[n]]];          }          key [iq[n]].push(iq[n+1])        } else    		key [iq[n]] = iq [n+1]    }    for (var i in key) {    	if (!Array.isArray(key[i])) {        if (key[i].match(/=|&|{/g)!=null) {            key [i] = rec (key[i],i);        }      }      else {      	for (var j in key[i]) {          if (key[i][j].match(/=|&|{/g)!=null) {              key [i][j] = rec (key[i][j],j);          }        }      }    }    function rec (query) {    var s = query.replace(/([\w]+)\/([\w]+)\//g,'$1:$2,').replace(/\/{/g,':{').replace(/}\//g,'},').replace(/=/g,':').replace(/&/g,',').replace(/([\w]+):([\w]+)/g,'$1:\'$2\'').replace(/([\w]+)\/([\w{}\':,\/]+)/g,'$1:{$2}').replace(/([\w]+)\/([\w\:\']+)/g,'$1:{$2}')    var t = s;    var a = t.match(/([\w]+):./g)    var b = [], indexOfCheck = 0;	for (var i = 0; i < a.length; i++) {		indexOfCheck += t.slice(indexOfCheck).indexOf(a[i]);		if (a.filter( item => item==a[i]).length > 1) {	  		if (checkScope(t, a[i], indexOfCheck)) b.push(a[i])		}	  }    var b1 = b.filter( item => item.slice(item.length - 1)== '\'')    var arr1 = [];for (var i=0;i<b1.length;i++){    if (b1[i] == b1[i+1])arr1.push(b1[i])    }    arr1= Array.from(new Set(arr1))    var b1 = b.filter( item => item.slice(item.length - 1)== '{')    var arr2 = [];for (var i=0;i<b1.length;i++){    if (b1[i] == b1[i+1])arr2.push(b1[i])    }    arr2= Array.from(new Set(arr2))    for (var i in arr1){    	  var key1 = arr1[i].replace(':\'','');        //for (var u= 0; u <2; u++) {        var v = '',done = false;        var v1 = key1+':[';        t = t.split('{').map( item => {    		if (!done || true) {          item = item.replace(new RegExp('('+key1+'):([\\w\']+)','g'),function(m){              v1 +=m.split(':')[1]+',';              return 'AAAAA';          })              if (v1 != key1+':['){                  v += v1;                  v1 = key1+':[';              }            }          if ((item.match(/}/g) || []).length % 2 ==1){           	done = true;            }            return item;        }).join('{')        v = v.slice(0, v.length - 1);      v = v.replace(new RegExp(','+key1+':','g'),',{'+key1+':');      var close = '';        for (var k= v.length - 1; k >=0 ;k--) {        	if (v[k] == '{') {          	close += '}';          } else if (v[k] == '[') {          	close += ']';          }        }        v += close;        var tmp = t.slice(0, t.indexOf('AAAAA'));        t = [t.slice(0, t.indexOf('AAAAA')),t.slice(t.indexOf('AAAAA')).replace(new RegExp('([A{5,}\'\':{'+key1+']+)'),v+',')].join('');        if (t.slice(t.length-1)==',')        	t = t.slice(0,t.length-1);          //}    }    for (var j in arr2) {    	var key1 = arr2[j].replace(':{','');      var v2 = key1+":[";      var startArr = t.indexOf(key1+':'),rep =0;      t.slice(startArr).split(key1+':').forEach(function(item){        if (item != "" && item[0]!='[') {        	rep += key1.length;          for (var i in item){            if (item[i]=='}') break;              v2+=item[i];              rep ++;            }          v2 += '},';          rep +=2;        }      })      if (v2 != key1+':[') {        v2 = v2.slice(0,v2.length-1)+'],';        t = [t.slice(0,startArr),v2,t.slice(startArr+rep+3)].join('');      }    }    var rr = 0;    (function loop(){    	rr ++;        try{    			var tmp= JSON.stringify(eval("(" + t + ")"));          t = JSON.parse(tmp);        } catch (e) {    for (var i =0; i < t.length; i++) {        	if ( t [i] == '{') {          	var dclose = true,oclose = false;          	for (var j=i;j < j.length; j++) {            	if (t[j] == '{') {              	dclose = false;              } else if (t[j] == '}' && !dclose)              	dclose = true;                else                  if (t[j] == '}' && dclose){                    oclose = true;                    break;                  }            }            if (!oclose) {            	t +='}';              break;            }          }        }        if (rr< 5)          loop();    }    }())     return t;    }	function oneArray(a) {	  for(var i in a) {	    if (typeof a =='object')	    	oneArray(a[i]);	    if (i.slice(0, 1) == '_') {	      a[ i.slice(1) ] = [ a[i] ];	      delete a[i];	    }	  }	}	oneArray(key);    return key;}function checkScope(str, item, pos) {	var start = false, end = false, startPos = 0, endPos = 0;  str = str.slice(1, str.length - 1);	for (var i=0;i < str.length; i++) {  	if (str[i] == '{') {    	start = true;      startPos = i;    }    if (str[i] == '}' && start) {    	start = false;    	end = true;      endPos = i;    }    if (end && str.slice(startPos, endPos).indexOf(item) > -1 &&    	startPos > pos    ) {    	return false;    }  }  return true;}