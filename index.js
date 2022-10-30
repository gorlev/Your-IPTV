
const express = require("express");
const app = express();
const config = require('./config');
const MANIFEST = require('./manifest');
const { getManifest, getCatalog, getMeta, getUserData } = require("./addon");

const NodeCache = require( "node-cache" );
const myCache = new NodeCache({stdTTL:15*60});

var respond = function (res, data) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  };
  
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname);

app.get("/", function (req, res) {
  res.redirect("/configure")
});

app.get("/:userConf?/configure", function (req, res) {
  const newManifest = { ...{MANIFEST} };
  res.render('configure.html',newManifest);
  // res.render('configure.html',{MANIFEST});
});

app.get('/manifest.json', function (req, res) {
  const newManifest = { ...MANIFEST };
  newManifest.behaviorHints.configurationRequired = true;
  respond(res, newManifest);
});

app.get('/:userConf/manifest.json', async function (req, res) {
  let newManifest = { ...MANIFEST };
  if (!((req || {}).params || {}).userConf) {
      newManifest.behaviorHints.configurationRequired = true;
      respond(res, newManifest);
  }else {
    try {

      if (myCache.has(`manifest-${req.params.userConf}`)) {
        respond(res,myCache.get(`manifest-${req.params.userConf}`))
      }else{
        newManifest = await getManifest(req.params.userConf)
        // newManifest.behaviorHints.configurationRequired = false;
        if(newManifest && newManifest.id){
          myCache.set(`manifest-${req.params.userConf}`,newManifest)
        }
        respond(res, newManifest);
      }  
    } catch (error) {
      console.log(error)
      respond(res,{error:error})
    }
  }
});

app.get('/:userConf/catalog/:type/:id/:extra?.json', async function (req, res) {
  let {userConf,type,id,extra} = req.params
  let extraObj, userConfiguration
  
  // try {
  //   userConfiguration = JSON.parse(Buffer.from(userConf, 'base64').toString())
  // } catch (error) {
  //   console.log(error)
  //   return []
  // }

  if(extra){
    try {
      extraObj = JSON.parse('{"' + decodeURI(extra.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
    } catch (error) {
      console.log(error)
      return respond(res, {metas:[]})
    }
  }
  
  if(extraObj && extraObj.genre && extraObj.genre.includes("+")){
    extraObj.genre = extraObj.genre.replace(/\+/g,' ')
  }

  // let pagination
  // if(extraObj && extraObj.skip){
  //   pagination =  extra.skip || 1
  //   pagination = Math.round((Number(extraObj.skip) / 16) + 1 )
  // }
  
  let metas = []
  try {

    if (myCache.has(`catalog-${userConf}-${type}-${id}-${extra}`)) {
      respond(res,myCache.get(`catalog-${userConf}-${type}-${id}-${extra}`))
    }else{
      metas = await getCatalog(userConf,type,extraObj.genre)
      if(metas.length > 0){
        myCache.set(`catalog-${userConf}-${type}-${id}-${extra}`,{metas: metas})
      }
      respond(res, {metas: metas})
    }

  } catch (error) {
    console.log(error)
    respond(res, {metas:[]})
    
  }
    
  // if(extraObj && extraObj.search){
  //   metas = await searchCatalogHandler(extraObj.search,userConfiguration.api,pagination,type)
  // }

});

app.get('/:userConf/meta/:type/:id.json', async function (req,res){

  let {userConf,type,id} = req.params

  try {
    if (myCache.has(`meta-${userConf}-${type}-${id}`)) {
      respond(res,myCache.get(`meta-${userConf}-${type}-${id}`))
    }else{
      const meta = await getMeta(userConf,type,id)
      if(meta && meta.id){
        myCache.set(`meta-${userConf}-${type}-${id}`,{meta:meta})
      }
      respond(res, {meta:meta})
    }

  } catch (error) {
    console.log(error)
    respond(res,{error})
  }
});

app.get('/:userConf/stream/:type/:id.json', function (req, res) {

  let {userConf,type,id} = req.params

  let extension = "mp4"
  const obj = getUserData(userConf)
  const streamID = id.split(":")[1]
  let stream = []
  if(type === "tv"){
    type = "live";
    extension = "ts";
    stream = [{
      url: `${obj.baseURL}/${type}/${obj.username}/${obj.password}/${streamID}.${extension}`,
      description:"Watch Now",
      behaviorHints :{
        notWebReady:true
      }
    }]
  }else{
    stream = [{
      url: `${obj.baseURL}/${type}/${obj.username}/${obj.password}/${streamID}.${extension}`,
      description:"Watch Now"
    }]
  }
  // console.log(stream)
  try {
    respond(res,{streams:stream})
  } catch (error) {
    console.log(error)
    respond(res,{streams:[]})
  }
});

if (module.parent) {
  module.exports = app;
} else {
  app.listen(config.port, function () {
  console.log(config)
});
}