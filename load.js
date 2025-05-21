javascript:(function(){
  var url='https://raw.githubusercontent.com/romemasters/virtualmouse/refs/heads/main/vitrualmouse.js';
  var methods=[
    // 1. <script> tag (original, will fail with CORS on GitHub raw)
    function(next){try{
      var s=document.createElement('script');
      s.src=url;
      s.onload=function(){done(0);};
      s.onerror=function(e){next(e);};
      document.body.appendChild(s);
      // Wait for error or success
      setTimeout(function(){next(new Error('Timeout loading <script>'));},3500);
    }catch(e){next(e);}
    },
    // 2. fetch+eval
    function(next){try{
      fetch(url).then(r=>r.text()).then(code=>{
        (1,eval)(code);
        done(1);
      }).catch(next);
    }catch(e){next(e);}
    },
    // 3. XMLHttpRequest+eval
    function(next){try{
      var req=new XMLHttpRequest();
      req.open('GET',url);
      req.onload=function(){
        if(req.status==200){
          (1,eval)(req.responseText);
          done(2);
        }else{next(new Error('XHR status '+req.status));}
      };
      req.onerror=next;
      req.send();
    }catch(e){next(e);}
    },
    // 4. fetch+Function()
    function(next){try{
      fetch(url).then(r=>r.text()).then(code=>{
        (new Function(code))();
        done(3);
      }).catch(next);
    }catch(e){next(e);}
    },
    // 5. XMLHttpRequest+Function()
    function(next){try{
      var req=new XMLHttpRequest();
      req.open('GET',url);
      req.onload=function(){
        if(req.status==200){
          (new Function(req.responseText))();
          done(4);
        }else{next(new Error('XHR status '+req.status));}
      };
      req.onerror=next;
      req.send();
    }catch(e){next(e);}
    },
    // 6. script tag with jsDelivr CDN fallback
    function(next){try{
      var s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/gh/romemasters/virtualmouse/vitrualmouse.js';
      s.onload=function(){done(5);};
      s.onerror=function(e){next(e);};
      document.body.appendChild(s);
      setTimeout(function(){next(new Error('Timeout loading jsDelivr <script>'));},3500);
    }catch(e){next(e);}
    },
    // 7. fetch+eval from jsDelivr
    function(next){try{
      fetch('https://cdn.jsdelivr.net/gh/romemasters/virtualmouse/vitrualmouse.js')
        .then(r=>r.text()).then(code=>{
          (1,eval)(code);
          done(6);
        }).catch(next);
    }catch(e){next(e);}
    },
    // 8. XMLHttpRequest+eval from jsDelivr
    function(next){try{
      var req=new XMLHttpRequest();
      req.open('GET','https://cdn.jsdelivr.net/gh/romemasters/virtualmouse/vitrualmouse.js');
      req.onload=function(){
        if(req.status==200){
          (1,eval)(req.responseText);
          done(7);
        }else{next(new Error('XHR status '+req.status));}
      };
      req.onerror=next;
      req.send();
    }catch(e){next(e);}
    },
    // 9. fetch+Function() from jsDelivr
    function(next){try{
      fetch('https://cdn.jsdelivr.net/gh/romemasters/virtualmouse/vitrualmouse.js')
        .then(r=>r.text()).then(code=>{
          (new Function(code))();
          done(8);
        }).catch(next);
    }catch(e){next(e);}
    },
    // 10. XMLHttpRequest+Function() from jsDelivr
    function(next){try{
      var req=new XMLHttpRequest();
      req.open('GET','https://cdn.jsdelivr.net/gh/romemasters/virtualmouse/vitrualmouse.js');
      req.onload=function(){
        if(req.status==200){
          (new Function(req.responseText))();
          done(9);
        }else{next(new Error('XHR status '+req.status));}
      };
      req.onerror=next;
      req.send();
    }catch(e){next(e);}
    }
  ];
  var tried=0, errors=[];
  function tryNext(err){
    if(err) errors.push(err);
    if(tried>=methods.length){
      alert('All attempts to load the script failed.\n\nErrors:\n'+errors.map(e=>(e&&e.message)||e).join('\n'));
      return;
    }
    console.log('%c[VirtualMouse]%c Trying method '+(tried+1)+' of '+methods.length,'color:#43a047;','color:');
    try{methods[tried++](tryNext);}catch(e){tryNext(e);}
  }
  function done(idx){
    console.log('%c[VirtualMouse]%c Loaded using method '+(idx+1),'color:#43a047;font-weight:bold','');
  }
  tryNext();
})();
